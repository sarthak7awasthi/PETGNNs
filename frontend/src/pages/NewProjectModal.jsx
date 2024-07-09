import React, { useState } from 'react';
import './NewProjectModal.css';

const NewProjectModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [collaborators, setCollaborators] = useState('');

  const handleSave = () => {
    const currentUserEmail = localStorage.getItem('id'); // Retrieve the current user's email from localStorage
    const collaboratorEmails = collaborators.split(',').map(email => email.trim());
    
    // Include the current user's email if not already in the list
    if (!collaboratorEmails.includes(currentUserEmail)) {
      collaboratorEmails.push(currentUserEmail);
    }

    const newProject = {
      name,
      description,
      collaborators: collaboratorEmails
    };
    onSave(newProject);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>New Project</h2>
        <label>Project Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}></textarea>
        <label>Collaborators (Comma separated emails)</label>
        <input type="text" value={collaborators} onChange={e => setCollaborators(e.target.value)} />
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
