// src/components/Quizzes.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Quizzes = ({ quizzes }) => {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/quizzes">Quizzes</Link></li>
          <li><a href="#education">Education</a></li>
          <li><a href="#gallery">Gallery</a></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>
      <div className="container">
        <h2>Select a Quiz</h2>
        <div className="quiz-options">
          {Object.entries(quizzes).map(([quizId, quizName]) => (
            <Link key={quizId} to={`/quiz/${quizId}`} className="quiz-btn">
              {quizName}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
