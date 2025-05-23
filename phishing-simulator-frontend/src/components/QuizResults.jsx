// src/components/QuizResults.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom'; // Add Link here
import Navbar from './Navbar';
import '../App.css';

const QuizResults = ({ user }) => {
  const location = useLocation();
  const { score, total, results } = location.state || { score: 0, total: 0, results: [] };

  // Initialize categories with default values
  const categories = {
    'Email Phishing': { total: 0, correct: 0 },
    'Spear-Phishing': { total: 0, correct: 0 },
    'Smishing': { total: 0, correct: 0 },
    'Vishing': { total: 0, correct: 0 },
    'Clone Phishing': { total: 0, correct: 0 },
    'Business Email Compromise (BEC)': { total: 0, correct: 0 },
  };

  // Process results and categorize them
  results.forEach(result => {
    const type = result.type;
    if (categories[type]) { // Validate the type exists in categories
      categories[type].total += 1;
      if (result.userAnswer === result.correctAnswer) {
        categories[type].correct += 1;
      }
    }
  });

  return (
    <div>
      <Navbar activePage="quiz" user={user} />
      <div className="container">
        <h2>Quiz Results</h2>
        <p>You got <strong>{score}/{total}</strong> correct.</p>

        <div>
          <h3>Performance by Category</h3>
          {Object.entries(categories).map(([category, { total, correct }]) => (
            <p key={category}>
              <strong>{category}:</strong> {correct}/{total}
            </p>
          ))}
        </div>

        {results.map((result, index) => {
          const { questionText, answerOptions, correctAnswer, userAnswer, explanation } = result;
          return (
            <div
              key={index}
              className={`quiz-question ${userAnswer === correctAnswer ? 'correct' : 'incorrect'}`}
            >
              <p><strong>{questionText}</strong></p>

              <ul>
                {answerOptions.map((option, idx) => (
                  <li
                    key={idx}
                    className={
                      option === correctAnswer
                        ? 'correct-answer'
                        : option === userAnswer && option !== correctAnswer
                        ? 'incorrect-answer'
                        : ''
                    }
                  >
                    {option} {option === correctAnswer ? '✔' : option === userAnswer ? '✖' : ''}
                  </li>
                ))}
              </ul>

              {userAnswer !== correctAnswer && (
                <p className="explanation">
                  <strong>Explanation:</strong> {explanation}
                </p>
              )}
            </div>
          );
        })}

        <Link to="/quizzes" className="btn">Try Another Quiz</Link>
      </div>
    </div>
  );
};

export default QuizResults;
