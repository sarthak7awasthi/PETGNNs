from flask import Blueprint, request, jsonify
import io
import numpy as np
import tensorflow as tf
from app.smpc import secure_aggregate_datasets
from app.training import train_gnn, aggregate_models
from app.encryption import encrypt_data_phe, decrypt_data_phe
from app.differential_privacy import add_differential_privacy
from app.psi import apply_psi
from petace.setops import PSIScheme
from petace.securenumpy import SecureArray
from app.validation import validate_data, validate_privacy_settings, validate_model_output

main = Blueprint('main', _name_)

model_updates = []
datasets = []

@main.route('/upload_dataset', methods=['POST'])
def upload_dataset():
    if 'dataset' not in request.files:
        return jsonify({"message": "No dataset file provided"}), 400
    
    file = request.files['dataset']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    # Convert file to byte stream and encrypt the data
    file_stream = io.BytesIO(file.read())
    data = np.loadtxt(file_stream, delimiter=',')
    
    # Validate the data
    if not validate_data(data):
        return jsonify({"message": "Invalid data format"}), 400
    
    encrypted_data = encrypt_data_phe(data)
    
    datasets.append({
        'filename': file.filename,
        'file_stream': io.BytesIO(encrypted_data.to_numpy().tobytes())
    })
    
    return jsonify({"message": "Dataset uploaded and encrypted successfully", "filename": file.filename}), 200

@main.route('/start_training', methods=['POST'])
def start_training():
    if len(datasets) == 0:
        return jsonify({"message": "No datasets uploaded"}), 400

    task_type = request.get_json().get('task_type')
    party_id = request.get_json().get('party_id')
    psi_scheme = PSIScheme.ECDH  

    if len(datasets) == 1:
        # Decrypt single dataset for training
        encrypted_dataset = datasets[0]['file_stream']
        secure_data = SecureArray(np.frombuffer(encrypted_dataset.getvalue(), dtype=np.float64), party=0, dtype=np.float64)
        aggregated_dataset = io.BytesIO(decrypt_data_phe(secure_data).tobytes())
    else:
        # Securely aggregate multiple datasets using SMPC and PSI
        encrypted_dataset_streams = [dataset['file_stream'] for dataset in datasets]
        decrypted_datasets = [SecureArray(np.frombuffer(ds.getvalue(), dtype=np.float64), party=0, dtype=np.float64) for ds in encrypted_dataset_streams]
        common_datasets = apply_psi(decrypted_datasets, party_id, psi_scheme)
        aggregated_dataset = secure_aggregate_datasets(common_datasets)

    # Encrypt the aggregated dataset using PHE
    data_array = np.frombuffer(aggregated_dataset.getvalue(), dtype=np.float64).reshape(-1, 1)  # Convert to numpy array for processing
    encrypted_data = encrypt_data_phe(data_array)

    # Apply differential privacy to the encrypted dataset
    epsilon = request.get_json().get('epsilon', 1.0) 
    private_data = add_differential_privacy(encrypted_data.to_numpy(), epsilon)
    
    # Convert back to byte stream for training
    private_data_stream = io.BytesIO()
    np.savetxt(private_data_stream, private_data, delimiter=',')
    private_data_stream.seek(0)

   
    project_name = request.get_json().get('project_name')
    train_gnn(private_data_stream, task_type)

    return jsonify({"message": "Training started for project " + project_name}), 200
@main.route('/receive_update', methods=['POST'])
def receive_update():
    update = request.get_json()
    model_updates.append(update)
 
    return jsonify({"message": "Model update received"}), 200

# @main.route('/aggregate_models', methods=['GET'])
# def aggregate_models():

#     aggregated_model = ""
#     return jsonify({"aggregated_model": aggregated_model}), 200

@main.route('/get_model', methods=['GET'])
def get_model():
    model = retrieve_model
    return jsonify({"model": "final_model"}), 200



@main.route('/incremental_training', methods=['POST'])
def incremental_training_endpoint():
    data = request.get_json().get('data')
    project_name = request.get_json().get('project_name')
    task_type = request.get_json().get('task_type')

    # Retrieve the existing model
    model = retrieve_model(project_name)

    # Perform incremental training
    updated_model = incremental_training(data, model, task_type)

    # Save the updated model
    save_model(updated_model, project_name)

    return jsonify({"message": "Incremental training completed for project " + project_name}), 200


@main.route('/adjust_weights', methods=['POST'])
def adjust_weights_endpoint():
    weights = request.get_json().get('weights')
    project_name = request.get_json().get('project_name')

    # Retrieve the existing model
    model = retrieve_model(project_name)

    # Adjust weights
    adjusted_model = adjust_weights(model, weights)

    # Save the adjusted model
    save_model(adjusted_model, project_name)

    return jsonify({"message": "Weights adjusted for project " + project_name}), 200

@main.route('/revert_to_checkpoint', methods=['POST'])
def revert_to_checkpoint_endpoint():
    project_name = request.get_json().get('project_name')

    model = retrieve_model(project_name)

 
    reverted_model = revert_to_checkpoint(model, project_name)


    save_model(reverted_model, project_name)

    return jsonify({"message": "Reverted to checkpoint for project " + project_name}), 200


@main.route('/logs', methods=['GET'])
def get_logs():
    project_name = request.args.get('project_name')


    logs = retrieve_logs(project_name)

    return jsonify({"logs": logs}), 200