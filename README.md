# PETGNNs

PPFGNN is a Graph Neural framework designed to perform federated learning while preserving privacy. This project integrates various privacy-preserving technologies such as Differential Privacy, Secure Multi-Party Computation (SMPC), Private Set Intersection (PSI), Homomorphic Encryption, and Sharding to ensure data confidentiality during collaborative training. PPFGNN is ideal for applications in fake news detection and fraud detection.

## Table of Contents
[Problem & Solution](https://github.com/sarthak7awasthi/PETGNNs#problem-&-solution)

[System Achitecture](https://github.com/sarthak7awasthi/PETGNNs#system-architecture)

[TikToks PETAce](https://github.com/sarthak7awasthi/PETGNNs#tiktoks-petace)

[GNN Building Flow](https://github.com/sarthak7awasthi/PETGNNs#gnn-building-flow)

[Usage](https://github.com/sarthak7awasthi/PETGNNs#usage)

## Problem & Solution

Imagine two organizations, Org A and Org B, both want to train a model to detect fake news. Org A has a dataset collected from social media, and Org B has a dataset from news websites. However, both organizations are concerned about sharing their sensitive data due to privacy issues.

Solution: PPFGNN

With PPFGNN, Org A and Org B can train a shared model without exposing their datasets to each other. Here's how it works:

- Create a Project:

  - Org A creates a new project in the PPFGNN UI for fake news detection and invites Org B to collaborate.
- Upload Datasets:

  - Both Org A and Org B upload their datasets to the PPFGNN system. The data remains encrypted and secure throughout the process.

- Configure Privacy Settings:
  - They configure the privacy settings to ensure their data is protected using techniques like Differential Privacy and SMPC.
- Start Training:
  - They start the federated training process. The model is trained on the combined knowledge from both datasets without either organization accessing the other's raw data.
- Monitor and Improve:
  - Throughout the training, both organizations can monitor the model’s performance through the PPFGNN UI and make adjustments as needed.
- Incremental Updates:

  - If Org A collects new data, they can incrementally update the model without retraining from scratch, ensuring the model stays up-to-date.
- Decremental Learning:

  - If Org B discovers some of their data is faulty or no longer relevant, they can use decremental learning techniques to remove the influence of that data from the model.
    
This way, both organizations benefit from a robust and accurate model without compromising their data privacy.

## System Architecture
![image](https://github.com/sarthak7awasthi/PETGNNs/assets/61361866/c41f935d-9b73-447b-9eaf-844b71865639)

#### Frontend
##### Framework: React with Vite
- Components:
  - User Authentication:
    - Login/Logout
    - User Profile Management
  - Main Dashboard View:
    - Existing Projects
    - New Project Create Button
  - Project Details:
    - Overview, dataset, architecture, hyperparameters, training progress, performance metrics, logs
    - Incremental and Decremental Learning:
    - Adjust Weights
    - Rebalance Dataset
    - Checkpoint Models
  - Visualizations:
    - Graph Visualization
    - Performance Charts

#### Backend
##### Framework: Express.js
- Components:
  - API Endpoints:
    - User Authentication
    - Project Management
    - Dataset Management
    - Training Commands
  - Authentication: User authentication and authorization

  - Continuous Integration and Validation:
    - Continuous Testing
    - Validation Mechanisms
#### Federated Learning and Cryptography Server
##### Framework: Python with TensorFlow Federated
  - Components:
    - Model Orchestration: Coordination of federated learning tasks across multiple clients
    - Privacy-Preserving Algorithms:
      - Differential Privacy
      - Secure Multi-Party Computation (SMPC)
      - Private Set Intersection (PSI)
      - Homomorphic Encryption
      - Sharding
  - Graph Construction and Feature Engineering:
    - Graph Formation
    - Feature Extraction
  - Model Training and Aggregation:
    - Parallel Model Training
    - Model Aggregation
  - Compilation and Final Model Presentation:
    - Model Compilation
    - Result Communication
  - Monitoring and Feedback:
    - Performance Monitoring
  
#### Client Nodes
##### Framework: Kubernetes
  - Components:
    - Pods: Individual instances of client nodes running on Kubernetes
    - Node Interaction: Communication between client nodes and the central server for federated learning tasks
    - Data Processing: Local data handling, basic validation, and transformation before federated learning
#### Communication
##### Protocols: HTTPS for secure communication
  - Components:
    - Client-Server Communication: Frontend interactions with the backend API
    - Inter-Client Communication: Coordination between clients during federated learning
    - Encryption: Ensuring all data transfers are encrypted end-to-end

## TikToks PETAce

I utilized TikTok's PETAce for a lot of the encryption covered in the project.
I used TikTok's [PETAce-Solo](https://github.com/tiktok-privacy-innovation/PETAce-Solo) for hashing and partial homomorphic encryption. I wrote CPP wrapper functions to get the outcomes.
I used the PETAce's [Python API](https://github.com/tiktok-privacy-innovation/PETAce/tree/main/python) for secureNumpy and SETOPS(PSI) support.

## GNN Building Flow

![image](https://github.com/sarthak7awasthi/PETGNNs/assets/61361866/0accb764-8bab-49bf-aab7-c8617c20d5f8)

## Usage

For Docker Container
```
docker-compose build
docker-compose up
```

For Local Kubernetes

```
minikube start
kubectl apply -f central-server-deployment.yaml
kubectl apply -f central-server-service.yaml
kubectl apply -f client-node-deployment.yaml
kubectl apply -f client-node-service.yaml
```
