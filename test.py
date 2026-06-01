import tensorflow as tf

print("TensorFlow Version:", tf.__version__)

model = tf.keras.models.load_model("backend/intellibin_model.keras")

print("MODEL LOADED SUCCESSFULLY")