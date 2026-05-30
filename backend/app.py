import os
from pymongo import MongoClient
from flask_cors import CORS
from datetime import datetime
from flask import Flask, request, render_template, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import base64
from io import BytesIO

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
client = MongoClient(os.environ.get("MONGODB_URI"))
db = client["intellibin"]
collection = db["detections"]

# Load trained model
model = tf.keras.models.load_model("intellibin_model.keras")

# Waste categories
classes = ['cardboard', 'glass', 'metal', 'paper', 'plastic']

# Waste icons
icons = {
    'cardboard': '📦',
    'glass': '🍾',
    'metal': '🔩',
    'paper': '📄',
    'plastic': '🧴'
}

# Disposal recommendations
recommendations = {
    'cardboard': 'Recycle in dry waste recycling bin.',
    'glass': 'Dispose carefully in glass recycling container.',
    'metal': 'Send to metal recycling facility.',
    'paper': 'Place in paper recycling bin.',
    'plastic': 'Dispose in plastic recycling bin.'
}

# Home route
@app.route('/')
def home():
    return render_template('index.html')

# Prediction route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("STEP 1")

        data = request.get_json(force=True)

        print("DATA RECEIVED:", type(data))

        if not data:
            return jsonify({"error": "No JSON received"}), 400

        print("STEP 2")

        # Get base64 image
        image_data = data.get("image")

        if not image_data:
            return jsonify({"error": "No image found"}), 400

        print("STEP 3")

        # Convert base64 to image
        image_bytes = base64.b64decode(image_data)

        print("STEP 4")

        # Open image
        image = Image.open(BytesIO(image_bytes)).convert('RGB')

        print("STEP 5")

        # Resize image
        image = image.resize((224, 224))

        print("STEP 6")

        # Convert image to array
        img_array = np.array(image) / 255.0

        print("STEP 7")

        # Expand dimensions
        img_array = np.expand_dims(img_array, axis=0)

        print("STEP 8")

        # Prediction
        prediction = model(img_array, training=False).numpy()

        print("STEP 9")

        class_index = np.argmax(prediction)
        confidence = float(np.max(prediction) * 100)

        print("STEP 10")

        label = classes[class_index]

        print("STEP 11")

        # collection.insert_one({
        #     "category": label,
        #     "confidence": round(confidence, 1),
        #     "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        #     "recommendation": recommendations[label],
        #     "co2_saved": 0.5
        # })

        print("STEP 12")

        return jsonify({
            "category": label,
            "confidence": round(confidence, 1),
            "reason": "Waste detected successfully",
            "disposal": recommendations[label],
            "recyclable": True,
            "co2_saved": 0.5
        })

    except Exception as e:
        import traceback

        print("ERROR OCCURRED:")
        traceback.print_exc()

        return jsonify({
            "error": str(e)
        }), 500

@app.route('/analytics', methods=['GET'])
def analytics():

    detections = list(
    collection.find({}, {"_id": 0})
)

    total = len(detections)

    if total == 0:
        return jsonify({
            "total": 0,
            "most_detected": "None",
            "co2_saved": 0,
            "recycling_score": 0,
            "categories": {},
            "weekly": [0,0,0,0,0,0,0]
        })

    category_counts = {}

    total_co2 = 0

    for item in detections:

        cat = item["category"]

        total_co2 += item["co2_saved"]

        if cat in category_counts:
            category_counts[cat] += 1
        else:
            category_counts[cat] = 1

    most_detected = max(category_counts, key=category_counts.get)

    recycling_score = min(100, int((total_co2 / total) * 100))
        # Monthly CO2 tracking
    current_month = datetime.now().month

    monthly_co2 = 0

    for item in detections:

        item_month = datetime.strptime(
            item["timestamp"],
            "%Y-%m-%d %H:%M:%S"
        ).month

        if item_month == current_month:
            monthly_co2 += item.get("co2_saved", 0)
        
        return jsonify({
            "total": total,
            "most_detected": most_detected,
            "co2_saved": round(total_co2, 2),
            "monthly_co2": round(monthly_co2, 2),
            "recycling_score": recycling_score,
            "categories": category_counts,
            "weekly": [12,18,25,30,15,22,total]
        })

@app.route('/history', methods=['GET'])
def history():

    detections = list(
        collection.find({}, {"_id": 0})
    )
    return jsonify(detections[::-1])

# Run app
if __name__ == '__main__':
    import os

    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)