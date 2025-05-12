import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import  { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap'; // BootstrapNavbar.Text will be available
import axios from 'axios';

const Navbar = ({ activePage, user, onLogout }) => {
  const navigate = useNavigate();
  const isAdmin = user && user.role === 'admin';

  const handleLogout = async () => {
    try {
      // First clear local data
      localStorage.removeItem('user');
      
      // Call onLogout function from parent to clear app state
      if (typeof onLogout === 'function') {
        onLogout();
      }

      // Make API request to logout endpoint
      await axios.post('/api/auth/logout');
      
      // Explicitly navigate to login
      // Consider using navigate('/login', { replace: true }) from react-router-dom for SPA navigation
      // if you are not intending a full page reload.
      // However, window.location.href will also work.
      window.location.href = '/#/login'; 
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API fails, still redirect to login
      window.location.href = '/#/login';
    }
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">Phishing Simulator</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={user ? "/home" : "/"} active={activePage === 'home'}>Home</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/quizzes" active={activePage === 'quizzes'}>Quizzes</Nav.Link>
                {isAdmin && (
                  <>
                    <Nav.Link as={Link} to="/admin" active={activePage === 'admin'}>Admin Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/campaigns" active={activePage === 'campaigns'}>Campaigns</Nav.Link>
                    <Nav.Link as={Link} to="/targets" active={activePage === 'targets'}>Targets</Nav.Link>
                    <Nav.Link as={Link} to="/reports" active={activePage === 'reports'}>Reports</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                {/* Show Admin Login link only for standard users (not admins) */}
                {user && !isAdmin && (
                  <Nav.Link as={Link} to="/admin/login" className="text-warning">
                    <i className="bi bi-shield-lock me-1"></i>Admin Login
                  </Nav.Link>
                )}
                {/* Corrected to use BootstrapNavbar.Text */}
                <BootstrapNavbar.Text className="me-3"> 
                  <i className="bi bi-person-circle me-1"></i>
                  {user?.username || 'Guest'}
                </BootstrapNavbar.Text>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" active={activePage === 'login'}>Login</Nav.Link>
                <Nav.Link as={Link} to="/register" active={activePage === 'register'}>Register</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;