import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ activePage, user }) => {
  // Check if user has admin role
  const isAdmin = user && user.role === 'admin';
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to={user ? "/home" : "/login"}>Phishing Simulator</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {/* Only show these links if user is logged in */}
            {user && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${activePage === 'quizzes' ? 'active' : ''}`} to="/quizzes">Quizzes</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${activePage === 'results' ? 'active' : ''}`} to="/results">My Results</Link>
                </li>
              </>
            )}
            
            {/* Links visible only to admin users */}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${activePage === 'targets' ? 'active' : ''}`} to="/targets">Targets</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${activePage === 'campaigns' ? 'active' : ''}`} to="/campaigns">Campaigns</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${activePage === 'reports' ? 'active' : ''}`} to="/reports">Reports</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    Admin
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/admin">Dashboard</Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/users/manage">User Management</Link>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {/* Admin login link - always visible */}
            <li className="nav-item">
              <Link 
                className={`nav-link ${activePage === 'adminLogin' ? 'active' : ''}`} 
                to="/admin/login"
              >
                <i className="bi bi-shield-lock me-1"></i>
                Admin Login
              </Link>
            </li>
            
            {/* User info and logout - only if logged in */}
            {user && (
              <>
                <li className="nav-item">
                  <span className="nav-link">
                    <i className="bi bi-person-circle me-1"></i>
                    {user.username} ({user.role})
                  </span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/logout">
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;