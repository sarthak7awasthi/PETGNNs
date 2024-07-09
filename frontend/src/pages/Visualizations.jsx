import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ForceGraph2D } from 'react-force-graph';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis as X,
  YAxis as Y,
  Tooltip,
  Legend
} from 'recharts';
import axios from 'axios';
import './Visualizations.css';

const Visualizations = () => {
    const { id } = useParams();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [performanceData, setPerformanceData] = useState([]);
    const [modelStats, setModelStats] = useState({ accuracy: 'N/A', loss: 'N/A', nodes: 0, edges: 0 });

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/projects/${id}/graph_data`);
                setGraphData(response.data);
            } catch (error) {
                console.error('Error fetching graph data', error);
            }
        };

        const fetchPerformanceData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/projects/${id}/performance_data`);
                setPerformanceData(response.data);
            } catch (error) {
                console.error('Error fetching performance data', error);
            }
        };

        const fetchModelStats = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/projects/${id}/model_stats`);
                setModelStats(response.data);
            } catch (error) {
                console.error('Error fetching model stats', error);
            }
        };

        fetchGraphData();
        fetchPerformanceData();
        fetchModelStats();
    }, [id]);

    const handleDownloadModel = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/projects/${id}/download_model`, {
                responseType: 'blob'
            });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(new Blob([response.data]));
            link.setAttribute('download', 'gcn_model.pth');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading model', error);
        }
    };

    return (
        <div className="visualizations">
            <h2>Model Visualizations</h2>
            <div className="graph-section">
                <h3>Graph Visualization</h3>
                <div className="graph-container">
                    <ForceGraph2D
                        graphData={graphData}
                        nodeAutoColorBy="color"
                        width={800}
                        height={600}
                    />
                </div>
            </div>
            <div className="performance-section">
                <h3>Performance Charts</h3>
                <LineChart width={800} height={400} data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <X dataKey="epoch" />
                    <Y />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="loss" stroke="#82ca9d" />
                </LineChart>
            </div>
            <div className="analytics-section">
                <h3>Model Analytics</h3>
                <p><strong>Final Accuracy:</strong> {modelStats.accuracy}</p>
                <p><strong>Final Loss:</strong> {modelStats.loss}</p>
                <p><strong>Number of Nodes:</strong> {modelStats.nodes}</p>
                <p><strong>Number of Edges:</strong> {modelStats.edges}</p>
            </div>
            <button className="download-button" onClick={handleDownloadModel}>Download Model</button>
        </div>
    );
};

export default Visualizations;
