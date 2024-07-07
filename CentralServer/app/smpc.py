import io
import numpy as np
from PETACE.python.petace.securenumpy import SecureArray, get_vm

def secure_aggregate_datasets(dataset_streams):
    """
    Securely aggregate datasets using SMPC.
    :param dataset_streams: List of dataset byte streams.
    :return: Aggregated dataset as a byte stream.
    """
    vm = get_vm()
    
    # Convert dataset streams to SecureArrays
    secure_datasets = [SecureArray(np.loadtxt(ds, delimiter=','), party=0, dtype=np.float64) for ds in dataset_streams]
    
    # Aggregate datasets securely
    aggregated_data = secure_datasets[0]
    for dataset in secure_datasets[1:]:
        aggregated_data = vm.execute_code('add', [aggregated_data, dataset])

    # Convert back to numpy array
    aggregated_data_np = aggregated_data.to_numpy()
    
    # Convert to byte stream for further processing
    aggregated_data_stream = io.BytesIO()
    np.savetxt(aggregated_data_stream, aggregated_data_np, delimiter=',')
    aggregated_data_stream.seek(0)

    return aggregated_data_stream