// src/components/QuizResults.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const QuizResults = ({ score, total, results }) => {
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
        <h2>Quiz Results</h2>
        <p>You got <strong>{score}/{total}</strong> correct.</p>
        {results.map((result, i) => {
          const [question, options, correct, user_answer] = result;
          return (
            <div 
              key={i} 
              className={`quiz-question ${user_answer === correct ? 'correct' : 'incorrect'}`}
            >
              <p><strong>{question}</strong></p>
              {options.map((option, j) => (
                <p 
                  key={j} 
                  className={option === correct ? 'correct-answer' : option === user_answer ? 'incorrect-answer' : ''}
                >
                  {option} {option === correct ? '✔' : option === user_answer ? '✖' : ''}
                </p>
              ))}
            </div>
          );
        })}
        <Link to="/quizzes" className="btn">Try Another Quiz</Link>
      </div>
    </div>
  );
};

export default QuizResults;
