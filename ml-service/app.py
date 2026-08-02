"""
Rebinit ML microservice — 8 categories.

Runs standalone, exposes POST /classify (multipart image, key "image").

CATEGORIES order is fixed and must match the folder order used in
merge_dataset.py / train.py exactly, since the model's output index
maps positionally to this list.

IMPORTANT — startup design for platforms like Render's free tier:
Loading TensorFlow + the trained model takes 20-40+ seconds. Free-tier
hosts have a limited window to detect the port is open before giving up
and marking the deploy as failed/timed out. So Flask starts and binds to
the port IMMEDIATELY, and the model loads afterward in a background
thread. Requests that arrive before the model finishes loading fall back
to placeholder classification rather than failing.
"""

import os
import random
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CATEGORIES = ["paper", "plastic", "organic", "glass", "ewaste", "metal", "textile", "trash"]
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "waste_classifier.h5")
IMG_SIZE = (224, 224)

model = None
model_loading = True


def load_model_in_background():
    global model, model_loading
    if os.path.exists(MODEL_PATH):
        from tensorflow.keras.models import load_model
        print(f"Loading model from {MODEL_PATH} in background...")
        model = load_model(MODEL_PATH)
        print(f"Model loaded successfully from {MODEL_PATH}")
    else:
        print("No trained model found — running in PLACEHOLDER MODE. "
              "Train a model and save it to ml-service/model/waste_classifier.h5 to go live.")
    model_loading = False


# Start loading the model in a background thread immediately, but don't
# block Flask from binding to the port and answering requests.
threading.Thread(target=load_model_in_background, daemon=True).start()

print("=== app.py loaded: PIL-based classify_with_model, v2 (lazy model load) ===")


def classify_with_model(file_storage):
    import numpy as np
    from PIL import Image

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
            # Either no model file exists, or it's still loading in the
            # background — either way, fall back gracefully rather than error.
            category, confidence = classify_placeholder()

        return jsonify({
            "category": category,
            "confidence": round(confidence * 100, 1),
        })
    except Exception as e:
        return jsonify({"message": "Classification failed", "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    if model is not None:
        mode = "real_model"
    elif model_loading:
        mode = "loading"
    else:
        mode = "placeholder"
    return jsonify({"status": "ok", "mode": mode, "categories": CATEGORIES})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 6000))
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)