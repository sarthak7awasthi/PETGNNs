import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ToggleSwitch from './ToggleSwitch';
import './ProjectDetails.css';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [datasets, setDatasets] = useState([]);
    const [dataset, setDataset] = useState(null);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingLogs, setTrainingLogs] = useState('');
    const [collaborators, setCollaborators] = useState('');
    const [taskType, setTaskType] = useState('Fake News Detection');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/projects/project/${id}`);
                setProject(response.data);
                setDatasets(response.data.datasets || []);
                setTaskType(response.data.taskType || 'Fake News Detection');
            } catch (error) {
                console.error('Error fetching project', error);
            }
        };

        fetchProject();
    }, [id]);

    const handleFileChange = (e) => {
        setDataset(e.target.files[0]);
    };

    const handleUploadDataset = async () => {
        if (dataset) {
            const formData = new FormData();
            formData.append('dataset', dataset);
            try {
                const response = await axios.post(`http://localhost:5001/upload_dataset`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setDatasets([...datasets, dataset.name]);
            } catch (error) {
                console.error('Error uploading dataset', error);
            }
        }
    };

    const handleStartTraining = async () => {
        try {
            setIsTraining(true);
            setTrainingLogs('');
            const response = await axios.post(`http://localhost:3000/projects/${id}/start_training`);
            const intervalId = setInterval(async () => {
                try {
                    const logsResponse = await axios.get(`http://localhost:3000/projects/${id}/training_logs`);
                    setTrainingLogs(logsResponse.data.logs);
                    if (logsResponse.data.status === 'completed') {
                        clearInterval(intervalId);
                        setIsTraining(false);
                    }
                } catch (error) {
                    console.error('Error fetching training logs', error);
                }
            }, 1000);
        } catch (error) {
            console.error('Error starting training', error);
            setIsTraining(false);
        }
    };

    const handleStopTraining = async () => {
        try {
            await axios.post(`http://localhost:3000/projects/${id}/stop_training`);
            setIsTraining(false);
        } catch (error) {
            console.error('Error stopping training', error);
        }
    };

    const handleAddCollaborator = async () => {
        try {
            await axios.post(`http://localhost:3000/projects/${id}/add_collaborator`, { collaborator: collaborators });
            setCollaborators('');
        } catch (error) {
            console.error('Error adding collaborator', error);
        }
    };

    const handleToggleTaskType = () => {
        const newTaskType = taskType === 'Fake News Detection' ? 'Fraud Detection' : 'Fake News Detection';
        setTaskType(newTaskType);
    };

    const handleSeeModel = () => {
        navigate(`/projects/${id}/visualizations`);
    };

    return (
        <div className="project-details">
            {project && (
                <>
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                    <div className="task-type">
                        <label>Task Type: {taskType}</label>
                        <ToggleSwitch checked={taskType === 'Fraud Detection'} onChange={handleToggleTaskType} />
                    </div>
                    <p>Status: {project.status}</p>
                </>
            )}
            <div className="center">
                <label>Upload New Dataset</label>
                <input type="file" onChange={handleFileChange} />
                <button onClick={handleUploadDataset}>Upload</button>
            </div>
            <div className="center">
                <h3>Uploaded Datasets</h3>
                <ul>
                    {datasets.map((dataset, index) => (
                        <li key={index}>{dataset}</li>
                    ))}
                </ul>
            </div>
            <div className="task-type">
                <label>Task Type: {taskType}</label>
                <ToggleSwitch checked={taskType === 'Fraud Detection'} onChange={handleToggleTaskType} />
            </div>
            <div className="center">
                <button onClick={handleStartTraining} disabled={isTraining}>Start Training</button>
                <button onClick={handleStopTraining} disabled={!isTraining}>Stop Training</button>
            </div>
            <div className="center">
                <h3>Training Logs</h3>
                <pre>{trainingLogs}</pre>
            </div>
            <div className="center">
                <h3>Incremental and Decremental Learning</h3>
                <button>Adjust Weights</button>
                <button>Rebalance Dataset</button>
                <button>Revert to Checkpoint Models</button>
            </div>
            <div className="privacy-settings">
                <h3>Privacy and Security Settings</h3>
                <label>Differential Privacy Level:</label>
                <select>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <label>Encryption Method:</label>
                <select>
                    <option value="none">None</option>
                    <option value="aes">AES</option>
                    <option value="rsa">RSA</option>
                </select>
                <label>SMPC Configuration:</label>
                <select>
                    <option value="none">None</option>
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                </select>
                <label>PSI Configuration:</label>
                <select>
                    <option value="none">None</option>
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>
            <div className="collaboration-management">
                <h3>Collaboration Management</h3>
                <label>Add Collaborator:</label>
                <input type="text" value={collaborators} onChange={(e) => setCollaborators(e.target.value)} />
                <button onClick={handleAddCollaborator}>Add</button>
            </div>
            <div className="center">
                <button onClick={handleSeeModel}>See Model</button>
            </div>
        </div>
    );
};

export default ProjectDetails;
