import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { projectAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Projects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    phoneNumber: '',
    email: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getAllProjects();
      setProjects(response.projects || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.phoneNumber || 
        !formData.email || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.phoneNumber.length !== 10 || !/^\d+$/.test(formData.phoneNumber)) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    try {
      await projectAPI.createProject(formData);
      toast.success('Project created successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        location: '',
        phoneNumber: '',
        email: '',
        startDate: '',
        endDate: ''
      });
      loadProjects();
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
    }
  };

  const handleRequestAccess = async (projectId) => {
    try {
      await projectAPI.requestAccess(projectId);
      toast.success('Access request submitted successfully!');
      loadProjects();
    } catch (error) {
      toast.error(error.message || 'Failed to request access');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <Navigation user={user} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Projects Management</h1>
        
        {user.userType === 'admin' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create New Project'}
          </button>
        )}
      </div>
      
      {showCreateForm && user.userType === 'admin' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Create New Project</h3>
          </div>
          
          <form onSubmit={handleCreateProject}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  className="form-input"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength="10"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-success">
              Create Project
            </button>
          </form>
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {user.userType === 'admin' ? 'All Projects' : 'Your Projects'}
            <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '10px' }}>
              ({projects.length} projects)
            </span>
          </h3>
        </div>
        
        {projects.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {projects.map(project => (
                <tr key={project._id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{project.name}</div>
                    {project.description && (
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                        {project.description.substring(0, 50)}...
                      </div>
                    )}
                  </td>

                  <td>{project.location}</td>
                  <td>{new Date(project.startDate).toLocaleDateString()}</td>
                  <td>{new Date(project.endDate).toLocaleDateString()}</td>

                  <td>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </td>

                  <td>
                    {/* CLIENT → REQUEST ACCESS */}
                    {user.userType === 'client' && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRequestAccess(project._id)}
                      >
                        Request Access
                      </button>
                    )}

                    {/* ADMIN → MANAGE ACCESS */}
                    {user.userType === 'admin' && (
                      <Link to={`/project-assign/${project._id}`}>
                        <button 
                          className="btn btn-success btn-sm" 
                          style={{ marginLeft: '10px' }}
                        >
                          Manage Access
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
              No projects found
            </p>
            {user.userType === 'admin' && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
