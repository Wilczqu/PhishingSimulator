// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null); // State to store user data
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
    setErrorMsg('');
    setIsLoading(true);

    try {
      console.log('Attempting login for:', username);
      const response = await axios.post('/api/login', { username, password });
      console.log('Login response:', response.data);

      if (response.data.success) {
        // Store the user data in local storage
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set user data
        setUser(response.data.user);

        // Call the onLogin function to update the app state
        onLogin(response.data.user);

        // Redirect to the admin dashboard if the user is an admin
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setErrorMsg(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        // Check for auth error status codes
        if (err.response.status === 401 || err.response.status === 403) {
          setErrorMsg('Invalid username or password');
        } else {
          setErrorMsg(err.response.data.message || 'Login failed');
        }
      } else {
        setErrorMsg('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
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
        
        {errorMsg && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            <label htmlFor="password">Password</label>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
