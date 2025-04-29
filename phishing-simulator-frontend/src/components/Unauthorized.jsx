import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Unauthorized = () => {
  return (
    <div className="container mt-5">
      <div className="card border-danger">
        <div className="card-header bg-danger text-white">
          <h2>Access Denied</h2>
        </div>
        <div className="card-body">
          <h4 className="card-title">You don't have permission to access this page</h4>
          <p className="card-text">
            This area requires special permissions. If you believe this is an error,
            please contact the administrator.
          </p>
          <Link to="/home" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;