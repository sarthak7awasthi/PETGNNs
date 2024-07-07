import numpy as np
import pandas as pd
import networkx as nx
import tensorflow as tf
from flask import Flask, request, jsonify
from incremental_learning import (update_graph_with_new_nodes, update_graph_with_new_edges, 
                                  periodic_retraining, trigger_based_retraining, 
                                  handle_concept_drift)
from decremental_learning import adjust_weights, rebalance_dataset, save_checkpoint, load_checkpoint
from monitoring import send_metrics_to_server, logger
from training import train_model, preprocess_data
from app.differential_privacy import add_differential_privacy
from app.psi import apply_psi
from app.smpc import secure_aggregate_datasets

app = Flask(_name_)


graph = nx.Graph()
model = None
data = pd.DataFrame()
project_name = ""
task_type = ""
epochs = 10
learning_rate = 0.01
checkpoint_path = "/checkpoints"

@app.route('/upload_dataset', methods=['POST'])
def upload_dataset():
    global data
    file = request.files['dataset']
    data = pd.read_csv(file)
    return jsonify({"message": "Dataset uploaded successfully"}), 200

@app.route('/start_training', methods=['POST'])
def start_training():
    global model, task_type, project_name, epochs, learning_rate
    request_data = request.get_json()
    project_name = request_data['project_name']
    task_type = request_data['task_type']
    epochs = request_data.get('epochs', 10)
    learning_rate = request_data.get('learning_rate', 0.01)

    # Preprocess data
    preprocessed_data = preprocess_data(data, task_type)
    private_data = add_differential_privacy(preprocessed_data, 1.0)

    # Start training
    model = train_model(private_data, task_type, project_name, epochs, learning_rate)
    return jsonify({"message": f"Training started for project {project_name}"}), 200

@app.route('/incremental_update', methods=['POST'])
def incremental_update():
    global model, data
    new_data = pd.read_csv(request.files['new_dataset'])
    new_nodes = request.json.get('new_nodes', [])
    new_edges = request.json.get('new_edges', [])
    trigger_condition = request.json.get('trigger_condition', False)
    concept_drift_detected = request.json.get('concept_drift_detected', False)

    graph = update_graph_with_new_nodes(graph, new_nodes)
    graph = update_graph_with_new_edges(graph, new_edges)

    model = periodic_retraining(model, new_data, task_type, project_name, epochs)
    model = trigger_based_retraining(model, new_data, task_type, project_name, trigger_condition)
    model = handle_concept_drift(model, concept_drift_detected)

    return jsonify({"message": f"Incremental update applied for project {project_name}"}), 200

@app.route('/decremental_update', methods=['POST'])
def decremental_update():
    global model, data
    data_points_to_forget = request.json.get('data_points_to_forget', [])
    data_points_to_remove = request.json.get('data_points_to_remove', [])

    model = adjust_weights(model, data_points_to_forget)
    model = rebalance_dataset(model, data, data_points_to_remove)

    return jsonify({"message": f"Decremental update applied for project {project_name}"}), 200

@app.route('/save_checkpoint', methods=['POST'])
def save_model_checkpoint():
    save_checkpoint(model, checkpoint_path)
    return jsonify({"message": "Checkpoint saved successfully"}), 200

@app.route('/load_checkpoint', methods=['POST'])
def load_model_checkpoint():
    global model
    model = load_checkpoint(checkpoint_path)
    return jsonify({"message": "Checkpoint loaded successfully"}), 200

if _name_ == '_main_':
    app.run(host='0.0.0.0', port=5001)