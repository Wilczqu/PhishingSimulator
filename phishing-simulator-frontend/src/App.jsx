import React, { useState, useEffect, createContext } from 'react';
import { HashRouter as  Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import all your components - make sure these match your actual component files
import PageTitle from './components/PageTitle';
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
import CampaignDetail from './components/CampaignDetail';
import CampaignReport from './components/CampaignReport';
import Targets from './components/Targets';
import EditTarget from './components/EditTarget';
import Reports from './components/Reports';
import UserResults from './components/UserResults';
import UserManagement from './components/UserManagement';
import AdminLogin from './components/AdminLogin';
import CampaignTargets from './components/CampaignTargets';
import PhishingDemo from './components/PhishingDemo';
import Office365Login from './components/templates/Office365Login';
import PhishingSuccess from './components/templates/PhishingSuccess';
import PreviewEmail from './components/templates/PreviewEmail';
import './App.css';

// Create a context to share user and auth functions
export const AuthContext = createContext();

// Define the main App component directly
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

// AppContent component with all the logic
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
  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    
    try {
  await axios.post('/api/auth/logout');
} catch (error) {
  console.error('Error during logout:', error);
} finally {
  navigate('/login');
}
  };

  // Protected Route component
  const ProtectedRoute = ({ element, requiredRole, title }) => {
    if (loading) {
      return <div className="container mt-5">Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return (
      <>
        <PageTitle title={title} />
        {React.cloneElement(element, { user, logout: handleLogout })}
      </>
    );
  };

  // Set up auth context value
  const authContextValue = {
    user,
    login: handleLogin,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <Routes>
        {/* Root path redirects based on auth status */}
        <Route path="/" element={
          user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        } />
        
        {/* Public routes */}
        <Route path="/login" element={
          <><PageTitle title="Login" /><Login onLogin={handleLogin} /></>
        } />
        <Route path="/register" element={
          <><PageTitle title="Register" /><Register /></>
        } />
        <Route path="/unauthorized" element={
          <><PageTitle title="Unauthorized" /><Unauthorized /></>
        } />
        
        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute element={<Home />} title="Home" />
        } />
        <Route path="/quizzes" element={
          <ProtectedRoute element={<Quizzes quizzes={quizzes} />} title="Quizzes" />
        } />
        <Route path="/quiz/:quizId" element={
          <ProtectedRoute element={<Quiz />} title="Take Quiz" />
        } />
        <Route path="/quiz_results/:quizId" element={
          <ProtectedRoute element={<QuizResults />} title="Quiz Results" />
        } />
        <Route path="/results" element={
          <ProtectedRoute element={<UserResults />} title="My Results" />
        } />
        <Route path="/logout" element={
          <><PageTitle title="Logout" /><Logout onLogout={handleLogout} /></>
        } />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute element={<AdminDashboard />} requiredRole="admin" title="Admin Dashboard" />
        } />
        <Route path="/campaigns" element={
          <ProtectedRoute element={<Campaigns />} requiredRole="admin" title="Campaigns" />
        } />
        <Route path="/targets" element={
          <ProtectedRoute element={<Targets />} requiredRole="admin" title="Targets" />
        } />
        <Route path="/edit-target/:id" element={
          <ProtectedRoute element={<EditTarget />} requiredRole="admin" title="Edit Target" />
        } />
        <Route path="/reports" element={
          <ProtectedRoute element={<Reports />} requiredRole="admin" title="Reports" />
        } />
        <Route path="/users/manage" element={
          <ProtectedRoute element={<UserManagement />} requiredRole="admin" title="User Management" />
        } />
        <Route path="/admin/login" element={
          <><PageTitle title="Admin Login" /><AdminLogin onLogin={handleLogin} /></>
        } />
        
        {/* Campaign routes */}
        <Route path="/campaign/:id" element={
          <ProtectedRoute element={<CampaignDetail />} requiredRole="admin" title="Campaign Details" />
        } />
        <Route path="/campaign/:id/targets" element={
          <ProtectedRoute element={<CampaignTargets />} requiredRole="admin" title="Campaign Targets" />
        } />
        <Route path="/campaign/:id/report" element={
          <ProtectedRoute element={<CampaignReport />} requiredRole="admin" title="Campaign Report" />
        } />
        
        {/* Phishing routes */}
        <Route path="/phishing-demo" element={<PhishingDemo user={user} />} />
        <Route path="/demo/preview-email" element={<PreviewEmail />} />
        <Route path="/phish/office365/demo_phish_token" element={<Office365Login />} />
        <Route path="/phish/:template/:token" element={<Office365Login />} />
        <Route path="/auth/success" element={<PhishingSuccess />} />
        
        {/* Default route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
};

export default App;