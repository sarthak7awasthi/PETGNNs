import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProjectCard from './ProjectCard';
import NewProjectModal from './NewProjectModal';
import './Dashboard.css';
import logo from '../assets/logo.jpg'


const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const userId = localStorage.getItem('id'); 


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/projects/${userId}`);
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects', error);
      }
    };

    fetchProjects();
  }, [userId]);

  const handleNewProject = async (newProject) => {
    try {
      const response = await axios.post('http://localhost:3000/projects', newProject);
      setProjects([...projects, response.data]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <img src={logo} className="logo" alt="logo" />
        <h1>Welcome</h1>
      </header>
      <div className="actions">
        <button className="new-project-btn" onClick={() => setShowModal(true)}>New Project</button>
      </div>
      <div className="project-list">
        {projects.map(project => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onSave={handleNewProject} />}
    </div>
  );
};

export default Dashboard;
