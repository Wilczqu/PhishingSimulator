// src/components/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Logout = () => {
  const navigate = useNavigate();

  useEffect (() => {
    // 1. Clear any session data, tokens, or cookies here if needed
    //    e.g., localStorage.removeItem('token');

    // 2. Redirect to the login page
    navigate('/login');
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default Logout;
