import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { reportAPI } from '../services/api';
import { toast } from 'react-toastify';

const Reports = ({ user }) => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportAPI.getReports();
      setReports(response);
    } catch (error) {
      toast.error(error.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await reportAPI.getUsersCSV();
      
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV report downloaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to download report');
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
        <h1>System Reports</h1>
        
        <button 
          className="btn btn-primary"
          onClick={handleDownloadCSV}
        >
          Download Users CSV
        </button>
      </div>
      
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        System analytics and performance reports.
      </p>
      
      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <h3 className="stat-label">Total Users</h3>
          <div className="stat-value">{reports?.user_stats?.totalUsers || 0}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            Admins: {reports?.user_stats?.adminUsers || 0} | 
            Clients: {reports?.user_stats?.clientUsers || 0}
          </div>
        </div>
        
        <div className="card stat-card">
          <h3 className="stat-label">Total Projects</h3>
          <div className="stat-value">{reports?.project_stats?.totalProjects || 0}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            Active: {reports?.project_stats?.activeProjects || 0}
          </div>
        </div>
        
        <div className="card stat-card">
          <h3 className="stat-label">Total Requests</h3>
          <div className="stat-value">{reports?.request_stats?.totalRequests || 0}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            Approval Rate: {reports?.request_stats?.approvalRate || '0%'}
          </div>
        </div>
        
        <div className="card stat-card">
          <h3 className="stat-label">Avg. Project Duration</h3>
          <div className="stat-value" style={{ fontSize: '1.8rem' }}>
            {reports?.project_stats?.averageProjectDuration || '0 days'}
          </div>
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activities</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Recent Projects */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Recent Projects</h4>
            {(reports?.recent_activities?.data?.recentProjects || []).length > 0 ? (
              <ul style={{ listStyle: 'none' }}>
                {(reports.recent_activities.data.recentProjects || []).map(project => (
                  <li key={project._id} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{project.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        Started: {new Date(project.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>No recent projects</p>
            )}
          </div>
          
          {/* Recent Users */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Recent Users</h4>
            {(reports?.recent_activities?.data?.recentUsers || []).length > 0 ? (
              <ul style={{ listStyle: 'none' }}>
                {(reports.recent_activities.data.recentUsers || []).map(user => (
                  <li key={user._id} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid #eee'
                  }}>
                    <div style={{ fontWeight: '600' }}>{user.username}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {user.email} | {user.userType}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>No recent users</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Project Timeline</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Upcoming Projects */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Upcoming Projects</h4>
            {(reports?.timeline?.data?.upcomingProjects || []).length > 0 ? (
              <ul style={{ listStyle: 'none' }}>
                {(reports.timeline.data.upcomingProjects || []).map(project => (
                  <li key={project._id} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid #eee'
                  }}>
                    <div style={{ fontWeight: '600' }}>{project.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Starts: {new Date(project.startDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Location: {project.location}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>No upcoming projects</p>
            )}
          </div>
          
          {/* Ending Soon */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Ending Soon</h4>
            {(reports?.timeline?.data?.endingProjects || []).length > 0 ? (
              <ul style={{ listStyle: 'none' }}>
                {(reports.timeline.data.endingProjects || []).map(project => (
                  <li key={project._id} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid #eee'
                  }}>
                    <div style={{ fontWeight: '600' }}>{project.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Ends: {new Date(project.endDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Status: {project.status}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>No projects ending soon</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;