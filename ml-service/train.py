"""
Fine-tunes MobileNetV2 on the 8-category waste dataset, in TWO phases:

  Phase 1 (frozen):     train only the new classification head, base frozen.
  Phase 2 (fine-tune):  unfreeze the top layers of MobileNetV2 and continue
                        training at a much lower learning rate, so the
                        pretrained features adapt slightly to your specific
                        waste images without being destroyed.

This two-phase approach is standard practice for transfer learning and
typically adds several points of accuracy over Phase 1 alone.

Expected folder structure for `data/` (created by merge_dataset.py):
  data/
    train/  paper/ plastic/ organic/ glass/ ewaste/ metal/ textile/ trash/
    val/    paper/ plastic/ organic/ glass/ ewaste/ metal/ textile/ trash/

Run:  python train.py
Output: model/waste_classifier.h5  (best-accuracy checkpoint, saved automatically)
"""

import os
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

PHASE1_EPOCHS = 10   # frozen base, train the new head
PHASE2_EPOCHS = 10   # unfrozen top layers, fine-tune at low LR
FINE_TUNE_LAYERS = 30  # how many of MobileNetV2's final layers to unfreeze

CATEGORIES = ["paper", "plastic", "organic", "glass", "ewaste", "metal", "textile", "trash"]
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_OUT = os.path.join(os.path.dirname(__file__), "model", "waste_classifier.h5")
os.makedirs(os.path.dirname(MODEL_OUT), exist_ok=True)

# ---- Data generators ----
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=20,
    zoom_range=0.15,
    horizontal_flip=True,
)
val_datagen = ImageDataGenerator(rescale=1.0 / 255)

train_gen = train_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "train"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    classes=CATEGORIES,
    class_mode="categorical",
)
val_gen = val_datagen.flow_from_directory(
    os.path.join(DATA_DIR, "val"),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    classes=CATEGORIES,
    class_mode="categorical",
)

# ---- Build model ----
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights="imagenet")
base_model.trainable = False  # frozen for Phase 1

x = GlobalAveragePooling2D()(base_model.output)
x = Dense(128, activation="relu")(x)
x = Dropout(0.3)(x)
output = Dense(len(CATEGORIES), activation="softmax")(x)

model = Model(inputs=base_model.input, outputs=output)

callbacks = [
    EarlyStopping(monitor="val_accuracy", patience=4, restore_best_weights=True),
    ModelCheckpoint(MODEL_OUT, monitor="val_accuracy", save_best_only=True),
]

# ---- Phase 1: train the head only ----
print("\n=== PHASE 1: training classification head (base frozen) ===\n")
model.compile(optimizer=Adam(learning_rate=1e-4), loss="categorical_crossentropy", metrics=["accuracy"])
model.fit(train_gen, validation_data=val_gen, epochs=PHASE1_EPOCHS, callbacks=callbacks)

# ---- Phase 2: unfreeze top layers, fine-tune at low LR ----
print(f"\n=== PHASE 2: fine-tuning top {FINE_TUNE_LAYERS} layers of MobileNetV2 ===\n")
base_model.trainable = True
for layer in base_model.layers[:-FINE_TUNE_LAYERS]:
    layer.trainable = False  # keep earlier layers frozen, only unfreeze the top chunk

# Much lower learning rate here — we don't want to wreck the pretrained weights,
# just nudge them toward your specific waste images.
model.compile(optimizer=Adam(learning_rate=1e-5), loss="categorical_crossentropy", metrics=["accuracy"])
model.fit(train_gen, validation_data=val_gen, epochs=PHASE2_EPOCHS, callbacks=callbacks)

print(f"\nDone. Best model (by val_accuracy) saved to {MODEL_OUT}")