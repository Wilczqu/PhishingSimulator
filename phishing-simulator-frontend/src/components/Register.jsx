import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap'; // Added Card and Form
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
      const response = await axios.post('/api/auth/register', {
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
    <div className="login-container"> {/* Outer container for centering */}
      <Card className="login-card">   {/* The visible card box */}
        <Card.Body>
          <div className="login-header">
            <i className="bi bi-person-plus"></i> {/* Changed icon to person-plus */}
            <h2>Phishing Simulator</h2>
            <p className="login-subtitle">Create your account</p>
          </div>
          
          {errorMsg && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMsg}
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
                minLength="3"
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
                minLength="6"
                autoComplete="new-password"
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
                  Registering...
                </>
              ) : 'Register'}
            </button>
          </Form>
          
          <div className="login-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;