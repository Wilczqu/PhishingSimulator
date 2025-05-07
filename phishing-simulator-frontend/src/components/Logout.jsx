// src/components/Logout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user data
    onLogout();
    
    // Redirect to login page
    navigate('/login');
  }, [navigate, onLogout]);

  return null; // This component doesn't render anything
};

export default Logout;
