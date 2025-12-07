import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation'; 
import { projectAPI, requestAPI, userAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    accessibleProjects: 0,
    pendingRequests: 0,
    totalUsers: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const projectsRes = await projectAPI.getAllProjects();
      const projects = projectsRes.projects || [];
      setRecentProjects(projects.slice(0, 5));
      
      if (user.userType === 'admin') {
        const [requestsRes, usersRes] = await Promise.all([
          requestAPI.getPendingRequests(),
          userAPI.getAllUsers()
        ]);
        
        setPendingRequests(requestsRes.requests || []);
        
        setStats({
          totalProjects: projectsRes.count || 0,
          accessibleProjects: projectsRes.count || 0,
          pendingRequests: requestsRes.count || 0,
          totalUsers: usersRes.count || 0
        });
      } else {
        const requestsRes = await requestAPI.getUserRequests();
        
        setStats({
          totalProjects: projectsRes.count || 0,
          accessibleProjects: projectsRes.count || 0,
          pendingRequests: requestsRes.count || 0,
          totalUsers: 0
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await requestAPI.updateRequest(requestId, { status: 'approved' });
      toast.success('Request approved successfully');
      loadDashboardData();
    } catch (error) {
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      await requestAPI.updateRequest(requestId, { status: 'denied' });
      toast.success('Request denied');
      loadDashboardData();
    } catch (error) {
      toast.error(error.message || 'Failed to deny request');
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
      
      <h1>Welcome back, {user.username}!</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Here's what's happening with your projects today.
      </p>
      
      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <h3 className="stat-label">Total Projects</h3>
          <div className="stat-value">{stats.totalProjects}</div>
        </div>
        
        <div className="card stat-card">
          <h3 className="stat-label">Accessible Projects</h3>
          <div className="stat-value">{stats.accessibleProjects}</div>
        </div>
        
        {user.userType === 'admin' && (
          <>
            <div className="card stat-card">
              <h3 className="stat-label">Pending Requests</h3>
              <div className="stat-value">{stats.pendingRequests}</div>
            </div>
            
            <div className="card stat-card">
              <h3 className="stat-label">Total Users</h3>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
          </>
        )}
      </div>
      
      {/* Recent Projects */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Projects</h3>
        </div>
        
        {recentProjects.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Location</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map(project => (
                <tr key={project._id}>
                  <td>{project.name}</td>
                  <td>{project.location}</td>
                  <td>{new Date(project.startDate).toLocaleDateString()}</td>
                  <td>{new Date(project.endDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No projects found. {user.userType === 'admin' && 'Create your first project!'}
          </p>
        )}
      </div>
      
      {/* Pending Requests (Admin Only) */}
      {user.userType === 'admin' && pendingRequests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Access Requests</h3>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Project</th>
                <th>Requested At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map(request => (
                <tr key={request._id}>
                  <td>{request.user?.username}</td>
                  <td>{request.project?.name}</td>
                  <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveRequest(request._id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDenyRequest(request._id)}
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;