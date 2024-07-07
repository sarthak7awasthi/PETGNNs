import tensorflow as tf
import tensorflow_federated as tff
import os
import json

# Define the GNN models for different tasks
def create_gnn_model(task_type):
    if task_type == 'Fraud Detection':
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(2, activation='softmax')
        ])
    elif task_type == 'Fake News Detection':
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(2, activation='softmax')
        ])
    else:
        raise ValueError('Unsupported task type')
    return model

def preprocess(data, task_type):

    if task_type == 'Fraud Detection':
     
        features = tf.convert_to_tensor(data['features'], dtype=tf.float32)
        labels = tf.convert_to_tensor(data['labels'], dtype=tf.int32)
    elif task_type == 'Fake News Detection':
       
        features = tf.convert_to_tensor(data['features'], dtype=tf.float32)
        labels = tf.convert_to_tensor(data['labels'], dtype=tf.int32)
    else:
        raise ValueError('Unsupported task type')
    return features, labels

# Define the federated computation for training
def model_fn(task_type):
    keras_model = create_gnn_model(task_type)
    input_spec = {
        'features': tf.TensorSpec(shape=[None, None], dtype=tf.float32),
        'labels': tf.TensorSpec(shape=[None], dtype=tf.int32)
    }
    return tff.learning.from_keras_model(
        keras_model,
        input_spec=input_spec,
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=[tf.keras.metrics.SparseCategoricalAccuracy()]
    )

# Define the training loop
def train_gnn(data, task_type, rounds=10):
    iterative_process = tff.learning.build_federated_averaging_process(lambda: model_fn(task_type))
    state = iterative_process.initialize()

    for round_num in range(1, rounds + 1):
        state, metrics = iterative_process.next(state, [data])
        print(f'Round {round_num}, Metrics={metrics}')

    return state

def aggregate_models(model_updates):
    aggregated_model = model_updates[0]
    for model_update in model_updates[1:]:
        for key in aggregated_model:
            aggregated_model[key] += model_update[key]
    
    for key in aggregated_model:
        aggregated_model[key] /= len(model_updates)
    
    return aggregated_model



def update_node_embeddings(data, model):

    updated_model = model
    for node in data['new_nodes']:
        updated_model.add_node(node)
    return updated_model

def update_edge_embeddings(data, model):
    
    updated_model = model
    for edge in data['new_edges']:
        updated_model.add_edge(edge)
    return updated_model

def handle_concept_drift(data, model):
  
    adjusted_model = model
    if data['concept_drift']:
        adjusted_model.learning_rate *= 0.9  
    return adjusted_model

def incremental_training(data, model, task_type):
    model = update_node_embeddings(data, model)
    model = update_edge_embeddings(data, model)
    model = handle_concept_drift(data, model)
    return model



def adjust_weights(model, weights):
  
    for layer in model.layers:
        for node, weight in weights.items():
            layer.weights[node] *= weight
    return model

def save_checkpoint(model, project_name):
  
    checkpoint_path = f'checkpoints/{project_name}_checkpoint.json'
    with open(checkpoint_path, 'w') as f:
        json.dump(model.get_weights(), f)

def load_checkpoint(project_name):
    
    checkpoint_path = f'checkpoints/{project_name}_checkpoint.json'
    with open(checkpoint_path, 'r') as f:
        weights = json.load(f)
    return weights

def revert_to_checkpoint(model, project_name):
   
    checkpoint_weights = load_checkpoint(project_name)
    model.set_weights(checkpoint_weights)
    return model