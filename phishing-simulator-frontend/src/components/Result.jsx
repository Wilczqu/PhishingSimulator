// src/components/Result.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Result = ({ score, total, resultText }) => {
  return (
    <div className="container">
      <h2>Quiz Results</h2>
      <p>You answered {score} out of {total} questions correctly.</p>
      <h3>You {resultText} the quiz!</h3>
      <Link to="/dashboard">Go back to Dashboard</Link>
    </div>
  );
};

export default Result;
