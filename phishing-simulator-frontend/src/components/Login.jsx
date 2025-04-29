// src/components/Login.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Login = ({ onLogin, message }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1) Get location to check if we came from Register with success
  const location = useLocation();
  const registrationSuccess = location.state?.registrationSuccess;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await axios.post('/api/login', { username, password });
      if (response.data.error === 'USER_NOT_FOUND') {
        setErrorMsg('User does not exist');
      } else if (response.data.error === 'INCORRECT_PASSWORD') {
        setErrorMsg('This login attempt failed due to incorrect password');
      } else {
        // success
        if (response.data.success) {
          // Get user data from response
          const userData = {
            username: username,
            role: response.data.role || 'user',
            id: response.data.userId
          };
          
          // Call the onLogin function passed as prop
          onLogin(userData);
          
          // Redirect will be handled by parent component or a redirect in App.js
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while logging in.');
    }
  };

  return (
    <>
      {/* Floating messages outside the container */}
      {errorMsg && (
        <div className="floating-error">
          {errorMsg}
        </div>
      )}
      {registrationSuccess && (
        <div className="floating-success">
          Registration successfully completed!
        </div>
      )}

      <div className="container">
        <h2>Login</h2>
        {message && <p style={{ color: 'red' }}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <input 
            type="text"
            name="username"
            placeholder="Username"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input 
            type="password"
            name="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>

        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </>
  );
};

export default Login;
