import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters long');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Force role to be 'user', never allow self-registration as admin
      const response = await axios.post('/api/register', {
        username,
        password,
        role: 'user' // Always register as regular user
      });

      if (response.data.success) {
        setSuccessMsg('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { state: { registrationSuccess: true } });
        }, 2000);
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg('An error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      {errorMsg && <p className="error-message">{errorMsg}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            required
            minLength="3"
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
            minLength="6"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;