import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { projectAPI, userAPI } from '../services/api';
import { toast } from 'react-toastify';

const ProjectAssign = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [accessibleUsers, setAccessibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const projectRes = await projectAPI.getProject(id);
      setProject(projectRes.project);
      setAccessibleUsers(projectRes.project.accessibleTo || []);
      
      const usersRes = await userAPI.getAllUsers();
      const clientUsers = usersRes.users.filter(u => u.userType === 'client');
      setClients(clientUsers);
    } catch (error) {
      toast.error(error.message || 'Failed to load data');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProject = async () => {
    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    try {
      await projectAPI.assignProject(id, { userId: selectedClient });
      toast.success('Project assigned successfully!');
      loadData();
      setSelectedClient('');
    } catch (error) {
      toast.error(error.message || 'Failed to assign project');
    }
  };

  const handleRemoveAccess = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user from the project?')) {
      try {
        await projectAPI.unassignProject(id, userId);
        toast.success('Access removed successfully!');
        loadData();
      } catch (error) {
        toast.error(error.message || 'Failed to remove access');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <Navigation user={user} />
        <div className="card">
          <h2>Project not found</h2>
          <button onClick={() => navigate('/projects')}>Back to Projects</button>
        </div>
      </div>
    );
  }


  const availableClients = clients.filter(client => 
    !accessibleUsers.some(user => user._id === client._id)
  );

  return (
    <div>
      <Navigation user={user} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Assign Project: {project.name}</h1>
          <p style={{ color: '#666' }}>Manage client access to this project</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/projects')}
        >
          Back to Projects
        </button>
      </div>

      {/* Assign New Client Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Assign to New Client</h3>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Select Client</label>
            <select
              className="form-select"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Select a client...</option>
              {availableClients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.username} ({client.email})
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="btn btn-success"
            onClick={handleAssignProject}
            disabled={!selectedClient}
            style={{ marginTop: '1rem' }}
          >
            Assign Project to Client
          </button>
        </div>
      </div>

      {/* Current Access List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Clients with Access
            <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '10px' }}>
              ({accessibleUsers.length} clients)
            </span>
          </h3>
        </div>
        
        {accessibleUsers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Assigned On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accessibleUsers.map(client => (
                <tr key={client._id}>
                  <td>{client.username}</td>
                  <td>{client.email}</td>
                  <td>
                    {/* You would need to track assignment date in your model */}
                    {new Date().toLocaleDateString()}
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveAccess(client._id)}
                      style={{ padding: '5px 10px' }}
                    >
                      Remove Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No clients have been assigned to this project yet.</p>
          </div>
        )}
      </div>

      {/* All Available Clients */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Available Clients</h3>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '1rem' 
          }}>
            {clients.map(client => {
              const hasAccess = accessibleUsers.some(user => user._id === client._id);
              return (
                <div 
                  key={client._id} 
                  className="card"
                  style={{ 
                    padding: '1rem',
                    background: hasAccess ? '#d4edda' : '#f8f9fa',
                    border: hasAccess ? '2px solid #28a745' : '1px solid #dee2e6'
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{client.username}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>{client.email}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className={`status-badge ${hasAccess ? 'status-active' : ''}`}>
                      {hasAccess ? 'Has Access ✓' : 'No Access'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAssign;