import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';

const Users = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'client'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load users');
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await userAPI.createUser(formData);
      toast.success('User created successfully!');
      setShowCreateForm(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        userType: 'client'
      });
      loadUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userAPI.updateUser(userId, { isActive: !currentStatus });
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to update user');
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
        <h1>User Management</h1>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New User'}
        </button>
      </div>
      
      {/* Create User Form */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Create New User</h3>
          </div>
          
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
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
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 characters"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">User Type *</label>
                <select
                  name="userType"
                  className="form-select"
                  value={formData.userType}
                  onChange={handleChange}
                  required
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="btn btn-success">
              Create User
            </button>
          </form>
        </div>
      )}
      
      {/* Users List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            All Users
            <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '10px' }}>
              ({users.length} users)
            </span>
          </h3>
        </div>
        
        {users.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>User Type</th>
                <th>Created At</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(userItem => (
                <tr key={userItem._id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{userItem.username}</div>
                  </td>
                  <td>{userItem.email}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: userItem.userType === 'admin' ? '#667eea' : '#27ae60',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {userItem.userType.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                  <td>
                    {userItem.lastLogin ? new Date(userItem.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: userItem.isActive ? '#d4edda' : '#f8d7da',
                      color: userItem.isActive ? '#155724' : '#721c24',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {userItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`btn btn-sm ${userItem.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(userItem._id, userItem.isActive)}
                    >
                      {userItem.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
              No users found
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create First User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;