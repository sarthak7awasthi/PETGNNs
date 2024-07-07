import numpy as np
import pandas as pd
import networkx as nx

def construct_graph(data):
    """
    Construct a graph from the dataset.
    :param data: The input data (numpy array or pandas DataFrame).
    :return: A NetworkX graph.
    """
    
    G = nx.Graph()
    for index, row in data.iterrows():
        G.add_edge(row['source'], row['target'])
    return G

def extract_features(graph):
    """
    Extract features from the graph.
    :param graph: A NetworkX graph.
    :return: A dictionary of features.
    """
   
    features = {node: {'degree': degree} for node, degree in graph.degree()}
    nx.set_node_attributes(graph, features)
    return features

def load_data(file_path):
    """
    Load data from a CSV file.
    :param file_path: Path to the CSV file.
    :return: A pandas DataFrame.
    """
    return pd.read_csv(file_path)

def process_data(file_path):
    """
    Load data, construct graph, and extract features.
    :param file_path: Path to the CSV file.
    :return: A NetworkX graph with features.
    """
    data = load_data(file_path)
    graph = construct_graph(data)
    features = extract_features(graph)
    return graph, features



def update_graph_with_new_nodes(graph, new_nodes):
    """
    Update the graph with new nodes.
    :param graph: A NetworkX graph.
    :param new_nodes: List of new nodes to be added.
    :return: Updated NetworkX graph.
    """
    graph.add_nodes_from(new_nodes)
    return graph

def update_graph_with_new_edges(graph, new_edges):
    """
    Update the graph with new edges.
    :param graph: A NetworkX graph.
    :param new_edges: List of new edges to be added.
    :return: Updated NetworkX graph.
    """
    graph.add_edges_from(new_edges)
    return graph