import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { requestAPI } from '../services/api';
import { toast } from 'react-toastify';

const Requests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await requestAPI.getPendingRequests();
      setRequests(response.requests || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      await requestAPI.updateRequest(requestId, { status });
      toast.success(`Request ${status} successfully`);
      loadRequests();
    } catch (error) {
      toast.error(error.message || `Failed to ${status} request`);
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
      
      <h1>Access Requests Management</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Review and manage project access requests from clients.
      </p>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Pending Requests
            <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '10px' }}>
              ({requests.length} requests)
            </span>
          </h3>
        </div>
        
        {requests.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>User</th>
                <th>Project</th>
                <th>Requested At</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request._id}>
                  <td>
                    <code style={{ fontSize: '0.9rem' }}>
                      {request._id.substring(0, 8)}...
                    </code>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{request.user?.username}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {request.user?.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{request.project?.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {request.project?.location}
                    </div>
                  </td>
                  <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: '#fff3cd',
                      color: '#856404',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {request.duration} days
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateRequest(request._id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleUpdateRequest(request._id, 'denied')}
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
              No pending requests at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;