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
        // Extract user data from response
        const userData = {
          id: response.data.user.id,
          username: response.data.user.username,
          role: response.data.user.role || 'user'
        };
        
        console.log('Login successful, user data:', userData);
        
        // Call onLogin to update app state
        onLogin(userData);
        
        // Redirect to home page
        navigate('/home');
      } else {
        setErrorMsg(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // Check for auth error status codes
        if (err.response.status === 401 || err.response.status === 403) {
          setErrorMsg('Invalid username or password');
        } else {
          setErrorMsg(err.response.data?.message || 'Login failed');
        }
      } else {
        setErrorMsg('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      
      {/* Registration success message with auto-dismiss */}
      {registrationSuccess && (
        <div className="alert alert-success">
          Registration successful! Please log in.
        </div>
      )}
      
      {/* Login error message */}
      {errorMsg && (
        <div className="alert alert-danger">
          {errorMsg}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
};

export default Login;
