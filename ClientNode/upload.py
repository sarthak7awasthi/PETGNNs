import requests
import io
import numpy as np
from encryption.py import encrypt_data_phe
from config import CENTRAL_SERVER_URL

def upload_dataset(file_path):

    data = np.loadtxt(file_path, delimiter=',')
    
 
    encrypted_data = encrypt_data_phe(data)
    
   
    encrypted_data_bytes = encrypted_data.to_numpy().tobytes()
    
    # Prepare file stream
    file_stream = io.BytesIO(encrypted_data_bytes)
    file_stream.name = file_path.split('/')[-1]
    

    response = requests.post(f'{CENTRAL_SERVER_URL}/upload_dataset', files={'dataset': file_stream})
    
    if response.status_code == 200:
        print('Dataset uploaded successfully')
    else:
        print('Failed to upload dataset:', response.text)
