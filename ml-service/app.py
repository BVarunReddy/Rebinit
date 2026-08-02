"""
Rebinit ML microservice — 8 categories.

Runs standalone on port 6000, exposes POST /classify (multipart image, key "image").

CATEGORIES order is fixed and must match the folder order used in
merge_dataset.py / train.py exactly, since the model's output index
maps positionally to this list.
"""

import os
import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CATEGORIES = ["paper", "plastic", "organic", "glass", "ewaste", "metal", "textile", "trash"]
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "waste_classifier.h5")

model = None
IMG_SIZE = (224, 224)

if os.path.exists(MODEL_PATH):
    from tensorflow.keras.models import load_model
    model = load_model(MODEL_PATH)
    print(f"Loaded trained model from {MODEL_PATH}")
else:
    print("No trained model found — running in PLACEHOLDER MODE. "
          "Train a model and save it to ml-service/model/waste_classifier.h5 to go live.")


print("=== app.py loaded: PIL-based classify_with_model, v2 ===")

def classify_with_model(file_storage):
    import numpy as np
    from PIL import Image

    print(">>> classify_with_model (PIL version) called")

    # file_storage is a Werkzeug FileStorage object (from request.files), not
    # a path or BytesIO — Keras's load_img() can't read it directly. PIL's
    # Image.open() can read from its underlying .stream just fine.
    img = Image.open(file_storage.stream).convert("RGB")
    img = img.resize(IMG_SIZE)

    arr = np.array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)

    predictions = model.predict(arr)[0]
    top_idx = int(np.argmax(predictions))
    return CATEGORIES[top_idx], float(predictions[top_idx])


def classify_placeholder():
    category = random.choice(CATEGORIES)
    confidence = round(random.uniform(0.80, 0.98), 2)
    return category, confidence


@app.route("/classify", methods=["POST"])
def classify():
    if "image" not in request.files:
        return jsonify({"message": "No image file provided under key 'image'"}), 400

    file = request.files["image"]

    try:
        if model is not None:
            category, confidence = classify_with_model(file)
        else:
            category, confidence = classify_placeholder()

        return jsonify({
            "category": category,
            "confidence": round(confidence * 100, 1),
        })
    except Exception as e:
        return jsonify({"message": "Classification failed", "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "mode": "real_model" if model else "placeholder", "categories": CATEGORIES})


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 6000))
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)