import React from 'react';

const Header = ({ user, onLogout }) => {
  if (!user) return null;
  
  return (
    <header className="app-header">
      <div className="logo">
        <span className="logo-icon">📊</span>
        <span>Project Management System</span>
      </div>
      
      <div className="header-actions">
        <div className="user-info">
          <span>Welcome, <strong>{user.username}</strong></span>
          <span className="user-badge">{user.userType.toUpperCase()}</span>
        </div>
        
        <button onClick={onLogout} className="btn btn-danger">
          <span>🚪</span> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;