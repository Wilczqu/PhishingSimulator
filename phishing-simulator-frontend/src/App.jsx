import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';
import Quizzes from './components/Quizzes';
import Result from './components/Result';
import AdminDashboard from './components/AdminDashboard';
import Logout from './components/Logout';
import Unauthorized from './components/Unauthorized';
import Campaigns from './components/Campaigns';
import Targets from './components/Targets';
import Reports from './components/Reports';

// Style imports - Bootstrap should be imported before custom styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Page title component to update document title
const PageTitle = ({ title }) => {
  useEffect(() => {
    document.title = `Phishing Simulator - ${title}`;
  }, [title]);
  return null;
};

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

  // Enhanced protected route component with title support
  const ProtectedRoute = ({ element, requiredRole, title }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return (
      <>
        <PageTitle title={title} />
        {React.cloneElement(element, { user })}
      </>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<><PageTitle title="Home" /><Home user={user} /></>} />
        <Route path="/home" element={<><PageTitle title="Home" /><Home user={user} /></>} />
        <Route path="/login" element={<><PageTitle title="Login" /><Login onLogin={handleLogin} /></>} />
        <Route path="/register" element={<><PageTitle title="Register" /><Register /></>} />
        <Route path="/unauthorized" element={<><PageTitle title="Unauthorized" /><Unauthorized /></>} />
        <Route path="/logout" element={<><PageTitle title="Logout" /><Logout onLogout={handleLogout} /></>} />
        
        {/* Protected routes with titles */}
        <Route 
          path="/admin" 
          element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" title="Admin Dashboard" />} 
        />
        
        {/* Main navigation routes */}
        <Route path="/campaigns" element={<ProtectedRoute element={<Campaigns />} title="Campaigns" />} />
        <Route path="/targets" element={<ProtectedRoute element={<Targets />} title="Targets" />} />
        <Route path="/reports" element={<ProtectedRoute element={<Reports />} title="Reports" />} />
        
        <Route 
          path="/quiz/:quizId" 
          element={
            <ProtectedRoute 
              element={<Quiz />} 
              title="Quiz" 
            />
          } 
        />
        <Route path="/quiz_results/:quizId" element={<><PageTitle title="Quiz Results" /><QuizResults /></>} />
        <Route path="/quizzes" element={<><PageTitle title="Quizzes" /><Quizzes quizzes={quizzes} /></>} />
        <Route path="/result" element={<><PageTitle title="Result" /><Result /></>} />
      </Routes>
    </Router>
  );
};

export default App;