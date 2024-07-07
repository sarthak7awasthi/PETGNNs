import tensorflow as tf
import numpy as np

def adjust_weights(model, data_points_to_forget):
    for data_point in data_points_to_forget:
        model_weights = model.get_weights()
        adjustment = calculate_adjustment(data_point)
        new_weights = [w - adjustment for w in model_weights]
        model.set_weights(new_weights)
    return model

def calculate_adjustment(data_point):
    return np.array(data_point) * 0.01

def rebalance_dataset(model, data, data_points_to_remove):
    data = data.drop(data_points_to_remove)
    model.fit(data, data['label'], epochs=5)
    return model

def save_checkpoint(model, checkpoint_path):
    model.save(checkpoint_path)

def load_checkpoint(checkpoint_path):
    return tf.keras.models.load_model(checkpoint_path)