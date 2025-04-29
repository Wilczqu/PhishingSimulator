import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ activePage }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">Phishing Simulator</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`} to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${activePage === 'targets' ? 'active' : ''}`} to="/targets">Targets</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${activePage === 'campaigns' ? 'active' : ''}`} to="/campaigns">Campaigns</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${activePage === 'reports' ? 'active' : ''}`} to="/reports">Reports</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/logout">Logout</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;