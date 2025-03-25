import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await axios.post('http://localhost:5000/api/register', {
        username,
        password
      });
      // Registration successful, redirect to /login
      navigate('/login', { state: { registrationSuccess: true } });
    } catch (err) {
      if (err.response && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg('An error occurred during registration.');
      }
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
