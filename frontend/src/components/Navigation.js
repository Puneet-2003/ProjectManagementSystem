import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = ({ user }) => {
  if (!user) return null;
  
  return (
    <nav className="app-nav">
      <ul className="nav-links">
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            end
          >
            <span>🏠</span> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/projects" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <span>📁</span> Projects
          </NavLink>
        </li>
        {user.userType === 'admin' && (
          <>
            <li>
              <NavLink 
                to="/users" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span>👥</span> Users
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/requests" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span>📋</span> Requests
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/reports" 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <span>📊</span> Reports
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;