import cv2
import numpy as np
import tensorflow as tf

# Load trained model
model = tf.keras.models.load_model("intellibin_model.h5")

# Class labels
classes = ['cardboard', 'glass', 'metal', 'paper', 'plastic']

# Open webcam
cap = cv2.VideoCapture(0)

# Check if webcam opened
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print("Press 'Q' to quit.")

while True:
    ret, frame = cap.read()

    if not ret:
        print("Failed to capture image")
        break

    # Resize frame for model
    img = cv2.resize(frame, (224, 224))

    # Normalize image
    img_array = np.array(img) / 255.0

    # Expand dimensions
    img_array = np.expand_dims(img_array, axis=0)

    # Prediction
    prediction = model.predict(img_array, verbose=0)

    # Get class index
    class_index = np.argmax(prediction)

    # Get confidence
    confidence = np.max(prediction) * 100

    # Get class label
    label = classes[class_index]

    # Display text
    text = f"{label} : {confidence:.2f}%"

    # Put text on screen
    cv2.putText(
        frame,
        text,
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    # Show webcam
    cv2.imshow("IntelliBin Waste Detection", frame)

    # Press Q to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release webcam
cap.release()
cv2.destroyAllWindows()