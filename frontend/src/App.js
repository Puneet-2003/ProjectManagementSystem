import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProjectAssign from './pages/ProjectAssign';

import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Users from './pages/Users';
import Requests from './pages/Requests';
import Reports from './pages/Reports';

import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Login successful!');
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        {user && <Header user={user} onLogout={handleLogout} />}
        
        <div className="main-container">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/signup" 
              element={
                user ? <Navigate to="/" /> : 
                <Signup />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                user ? <Dashboard user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/projects" 
              element={
                user ? <Projects user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/users" 
              element={
                user && user.userType === 'admin' ? <Users user={user} /> : 
                <Navigate to="/" />
              } 
            />
            <Route 
              path="/requests" 
              element={
                user && user.userType === 'admin' ? <Requests user={user} /> : 
                <Navigate to="/" />
              } 
            />
     
          <Route 
            path="/project-assign/:id" 
            element={
              user && user.userType === 'admin' ? <ProjectAssign user={user} /> : 
              <Navigate to="/" />
            } 
          />
            <Route 
              path="/reports" 
              element={
                user && user.userType === 'admin' ? <Reports user={user} /> : 
                <Navigate to="/" />
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
