import io
import numpy as np
from PETACE.python.petace.setops import PSI, PSIScheme
from PETACE.python.petace.network import Network

def apply_psi(datasets, party_id, psi_scheme):
    """
    Apply Private Set Intersection (PSI) to identify common data points securely.
    :param datasets: List of dataset byte streams.
    :param party_id: The party ID.
    :param psi_scheme: The PSI scheme to use.
    :return: List of datasets with common data points.
    """
    net = Network()  
    psi_instance = PSI(net, party_id, psi_scheme)

    # Convert dataset streams to lists of data points
    datasets = [np.loadtxt(ds, delimiter=',').flatten().tolist() for ds in datasets]

    intersection = psi_instance.process(datasets[party_id], obtain_result=True, verbose=True)

 
    common_data = np.array(intersection).reshape(-1, len(intersection))
    common_datasets = [common_data for _ in datasets]

    return common_datasets