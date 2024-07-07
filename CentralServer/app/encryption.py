import numpy as np
from PETACE.python.petace.securenumpy import SecureArray, get_vm

def encrypt_data_phe(data):
    """
    Encrypt data using Paillier cryptosystem (PHE).
    :param data: The input data (numpy array).
    :return: Encrypted data as SecureArray.
    """
    secure_data = SecureArray(data, party=0, dtype=np.float64)
    return secure_data

def decrypt_data_phe(secure_data):
    """
    Decrypt data encrypted with Paillier cryptosystem (PHE).
    :param secure_data: Encrypted SecureArray.
    :return: Decrypted data as numpy array.
    """
    data = secure_data.to_numpy()
    return data