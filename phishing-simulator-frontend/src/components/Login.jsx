// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Form } from 'react-bootstrap';
import '../App.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Get location to check if we came from Register with success
  const location = useLocation();
  const [registrationSuccess, setRegistrationSuccess] = useState(
    location.state?.registrationSuccess || false
  );

  // Clear registration success message after 3 seconds
  useEffect(() => {
    let timer;
    if (registrationSuccess) {
      timer = setTimeout(() => {
        setRegistrationSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [registrationSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      if (response.data.success) {
        onLogin(response.data.user);
        // Redirect to the admin dashboard if the user is an admin
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response.data.error || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container"> {/* Outer container for centering */}
      <Card className="login-card">   {/* The visible card box */}
        <Card.Body>
          <div className="login-header">
            <i className="bi bi-shield-lock"></i>
            <h2>Phishing Simulator</h2>
            <p className="login-subtitle">Sign in to your account</p>
          </div>
          
          {registrationSuccess && (
            <div className="alert alert-success">
              Registration successful! Please log in.
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}
          
          <Form onSubmit={handleSubmit} className="login-form">
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Username"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <label htmlFor="username">Username</label>
            </div>
            
            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <label htmlFor="password">Password</label>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </Form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
