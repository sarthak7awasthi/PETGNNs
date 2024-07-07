import numpy as np
from PETACE.python.petace.securenumpy import SecureArray, get_vm
from PETACE.python.petace.securenumpy.math import sum as secure_sum

def add_differential_privacy(data: np.ndarray, epsilon: float) -> np.ndarray:
    """
    Apply differential privacy by adding Laplacian noise to the data using PETACE SecureArray.
    :param data: The input data (e.g., numpy array).
    :param epsilon: Privacy budget parameter.
    :return: The data with added noise.
    """
    vm = get_vm()
    sensitivity = 1.0  

    # Convert the data to SecureArray
    secure_data = SecureArray(data, party=0, dtype=np.float64)
    
    # Generate Laplacian noise using numpy
    noise = np.random.laplace(0, sensitivity / epsilon, data.shape)
    
    # Convert noise to SecureArray
    secure_noise = SecureArray(noise, party=0, dtype=np.float64)
    
    # Add noise to the data securely
    private_data = secure_sum([secure_data, secure_noise])
    
    # Convert back to numpy array
    private_data_np = private_data.to_numpy()

    return private_data_np