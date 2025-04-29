import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
// Remove Dashboard import and use Home instead
// import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';
import Quizzes from './components/Quizzes';
import Result from './components/Result';
import AdminDashboard from './components/AdminDashboard';
import Logout from './components/Logout';
import Unauthorized from './components/Unauthorized';

import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(true);

  // Check if user is logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Fetch quizzes from backend
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('/api/quizzes');
        if (response.data) {
          setQuizzes(response.data);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Protected route component
  const ProtectedRoute = ({ element, requiredRole }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return React.cloneElement(element, { user });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
        
        {/* Protected routes */}
        <Route 
          path="/admin" 
          element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} 
        />
        
        {/* Replace Dashboard with Home */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute element={<Home />} />} 
        />
        
        <Route
          path="/quiz/:quizId"
          element={<Quiz user={user} />}
        />
        
        <Route
          path="/quiz_results/:quizId"
          element={<QuizResults />}
        />
        
        <Route
          path="/quizzes"
          element={<Quizzes quizzes={quizzes} />}
        />
        
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
};

export default App;