import React, { useState } from 'react';
import  { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import { Card, Form } from 'react-bootstrap';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Using the same endpoint as regular login but checking for admin role
      const response = await axios.post('/api/auth/login', { // Changed from /api/login
        username, 
        password 
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        
        // Check if user has admin privileges
        if (userData.role === 'admin') {
          // Use the onLogin handler from App.jsx
          if (onLogin) {
            onLogin(userData);
          } else {
            // Fallback if onLogin prop isn't passed
            localStorage.setItem('user', JSON.stringify(userData));
          }
          
          // Navigate to admin dashboard
          navigate('/admin');
        } else {
          setError('You do not have administrative privileges');
        }
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Card.Body>
          <div className="login-header">
            <i className="bi bi-shield-lock admin-icon"></i>
            <h2>Admin Login</h2>
            <p className="login-subtitle">Sign in with administrator credentials</p>
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <Form className="login-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input 
                type="text" 
                id="username" 
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                autoFocus
                disabled={loading}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-danger" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : 'Sign in as Admin'}
              </button>
            </div>
          </Form>
          
          <div className="login-footer">
            <p>
              Not an administrator? <Link to="/login">Regular Login</Link>
            </p>
            <p className="text-muted small mt-2">
              Default admin: admintud / admintud
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminLogin;