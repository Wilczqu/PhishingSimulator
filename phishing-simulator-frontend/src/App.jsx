import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';
import Quizzes from './components/Quizzes';
import AdminDashboard from './components/AdminDashboard';
import Logout from './components/Logout';
import Unauthorized from './components/Unauthorized';
import Campaigns from './components/Campaigns';
import Targets from './components/Targets';
import EditTarget from './components/EditTarget';
import Reports from './components/Reports';
import UserResults from './components/UserResults';
import UserManagement from './components/UserManagement'; // New component for admin to manage users
import AdminLogin from './components/AdminLogin'; // Import AdminLogin component
import CampaignDetail from './components/CampaignDetail'; // Add this import at the top of App.jsx with your other imports
import CampaignTargets from './components/CampaignTargets'; // Add this import

// Style imports - Bootstrap should be imported before custom styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Make sure this is included
import './App.css';

// Page title component to update document title
const PageTitle = ({ title }) => {
  useEffect(() => {
    document.title = `Phishing Simulator - ${title}`;
  }, [title]);
  return null;
};

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing auth on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Force redirect to login when app initializes and user is not logged in
  useEffect(() => {
    if (!loading && !user && window.location.hash !== '#/login' && window.location.hash !== '#/register') {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  // Fetch quizzes data
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('/api/quizzes');
        setQuizzes(response.data);
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

  // Protected Route component
  const ProtectedRoute = ({ element, requiredRole, title }) => {
    if (loading) {
      return <div className="container mt-5">Loading...</div>;
    }

    // If no user is logged in, redirect to login page
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    // If role is required and user doesn't have it
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Pass title to PageTitle and user to element
    return (
      <>
        <PageTitle title={title} />
        {React.cloneElement(element, { user })}
      </>
    );
  };

  return (
    <Routes>
      {/* Root path redirects based on auth status */}
      <Route path="/" element={
        user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Public routes */}
      <Route path="/login" element={
        user ? <Navigate to="/home" replace /> : <><PageTitle title="Login" /><Login onLogin={handleLogin} /></>
      } />
      <Route path="/register" element={
        user ? <Navigate to="/home" replace /> : <><PageTitle title="Register" /><Register /></>
      } />
      <Route path="/unauthorized" element={<><PageTitle title="Unauthorized" /><Unauthorized /></>} />
      <Route path="/logout" element={<><PageTitle title="Logout" /><Logout onLogout={handleLogout} /></>} />
      
      {/* Protected routes */}
      <Route path="/home" element={<ProtectedRoute element={<Home />} title="Home" />} />
      <Route path="/quizzes" element={<ProtectedRoute element={<Quizzes quizzes={quizzes} />} title="Quizzes" />} />
      <Route path="/quiz/:quizId" element={<ProtectedRoute element={<Quiz />} title="Take Quiz" />} />
      <Route path="/quiz_results/:quizId" element={<ProtectedRoute element={<QuizResults />} title="Quiz Results" />} />
      <Route path="/results" element={<ProtectedRoute element={<UserResults />} title="My Results" />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" title="Admin Dashboard" />} />
      <Route path="/campaigns" element={<ProtectedRoute element={<Campaigns />} requiredRole="admin" title="Campaigns" />} />
      <Route path="/targets" element={<ProtectedRoute element={<Targets />} requiredRole="admin" title="Targets" />} />
      <Route path="/edit-target/:id" element={<ProtectedRoute element={<EditTarget />} requiredRole="admin" title="Edit Target" />} />
      <Route path="/reports" element={<ProtectedRoute element={<Reports />} requiredRole="admin" title="Reports" />} />
      <Route path="/users/manage" element={<ProtectedRoute element={<UserManagement />} requiredRole="admin" title="User Management" />} />
      
      {/* Campaign detail route - This is what was missing */}
      <Route path="/campaign/:id" element={<ProtectedRoute element={<CampaignDetail />} requiredRole="admin" title="Campaign Details" />} />
      
      {/* Add this route if you need to manage campaign targets */}
      <Route path="/campaign/:id/targets" element={<ProtectedRoute element={<CampaignTargets />} requiredRole="admin" title="Campaign Targets" />} />
      
      <Route path="/admin/login" element={
        <><PageTitle title="Admin Login" /><AdminLogin onLogin={handleLogin} /></>
      } />
      
      {/* Default route (not found) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;