import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/projects/${project._id}`);
  };

  return (
    <div className="project-card" onClick={handleCardClick}>
      <h2>{project.name}</h2>
      <p>Created on: {new Date(project.createdDate).toLocaleDateString()}</p>
      <p>Status: {project.status}</p>
    </div>
  );
};

export default ProjectCard;
