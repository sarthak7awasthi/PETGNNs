import tensorflow as tf
import numpy as np
import pandas as pd
import tensorflow_federated as tff
from PETAce.python.petace.securenumpy import SecureArray, get_vm
import logging
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('TrainingLogger')

class HTTPHandler(logging.Handler):
    def emit(self, record):
        log_entry = self.format(record)
        try:
            response = requests.post('http://localhost:3000/logs', json={'log': log_entry})
            if response.status_code != 200:
                print(f"Failed to send log: {response.status_code}")
        except Exception as e:
            print(f"Error sending log: {e}")

# Add HTTPHandler to logger
http_handler = HTTPHandler()
http_handler.setLevel(logging.INFO)
logger.addHandler(http_handler)

def preprocess_data(data, task_type):
    if task_type == 'fraud_detection':
        data = data.dropna()
        data['transaction_amount'] = np.log1p(data['transaction_amount'])
    elif task_type == 'fake_news_detection':
        data = data.fillna('')
        data['text_length'] = data['text'].apply(len)
    return data

def build_model(task_type, input_shape):
    if task_type == 'fraud_detection':
        model = tf.keras.models.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(input_shape,)),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    elif task_type == 'fake_news_detection':
        model = tf.keras.models.Sequential([
            tf.keras.layers.Embedding(input_dim=10000, output_dim=64, input_length=input_shape),
            tf.keras.layers.LSTM(64),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

def send_metrics_to_server(project_name, epoch, loss, accuracy):
    """
    Send training metrics to the HTTP server.
    :param project_name: Name of the project.
    :param epoch: Current epoch number.
    :param loss: Current loss value.
    :param accuracy: Current accuracy value.
    """
    metrics = {
        'project_name': project_name,
        'epoch': epoch,
        'loss': loss,
        'accuracy': accuracy
    }
    try:
        response = requests.post('http://ylocalhost:3000/metrics', json=metrics)
        if response.status_code != 200:
            print(f"Failed to send metrics: {response.status_code}")
    except Exception as e:
        print(f"Error sending metrics: {e}")

def train_model(data, task_type, project_name, epochs=10, learning_rate=0.01):
    data = preprocess_data(data, task_type)
    input_shape = data.shape[1]
    model = build_model(task_type, input_shape)
    
    for epoch in range(epochs):
        history = model.fit(data, data['label'], epochs=1, verbose=0)
        loss = history.history['loss'][0]
        accuracy = history.history['accuracy'][0]
        
        # Send metrics to the HTTP server
        send_metrics_to_server(project_name, epoch, loss, accuracy)
        
        # Log training progress
        logger.info(f"Project: {project_name}, Epoch: {epoch}, Loss: {loss}, Accuracy: {accuracy}")
    
    return model

def periodic_retraining(model, data, task_type, project_name, epochs):
    data = preprocess_data(data, task_type)
    
    for epoch in range(epochs):
        history = model.fit(data, data['label'], epochs=1, verbose=0)
        loss = history.history['loss'][0]
        accuracy = history.history['accuracy'][0]
        
        # Send metrics to the HTTP server
        send_metrics_to_server(project_name, epoch, loss, accuracy)
        
        # Log training progress
        logger.info(f"Project: {project_name}, Epoch: {epoch}, Loss: {loss}, Accuracy: {accuracy}")
    
    return model

def trigger_based_retraining(model, data, task_type, project_name, trigger_condition):
    if trigger_condition:
        data = preprocess_data(data, task_type)
        history = model.fit(data, data['label'])
        loss = history.history['loss'][0]
        accuracy = history.history['accuracy'][0]

        # Send metrics to the HTTP server
        send_metrics_to_server(project_name, 0, loss, accuracy)

        # Log retraining progress
        logger.info(f"Project: {project_name}, Retraining triggered, Loss: {loss}, Accuracy: {accuracy}")

    return model

def handle_concept_drift(model, concept_drift_detected):
    if concept_drift_detected:
        new_learning_rate = model.optimizer.learning_rate * 0.9
        tf.keras.backend.set_value(model.optimizer.learning_rate, new_learning_rate)
    return model

def update_graph_with_new_nodes(graph, new_nodes):
    graph.add_nodes_from(new_nodes)
    return graph

def update_graph_with_new_edges(graph, new_edges):
    graph.add_edges_from(new_edges)
    return graph

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

def aggregate_models(models):
    """
    Aggregate the trained models securely.
    :param models: List of trained models.
    :return: The aggregated model.
    """
    vm = get_vm()
    secure_models = [SecureArray(model, party=0, dtype=np.float64) for model in models]
    aggregated_model = secure_add(secure_models)
    aggregated_model_np = aggregated_model.to_numpy()
    return aggregated_model_np