// src/components/Quiz.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Quiz = ({ quiz }) => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});

  const handleOptionChange = (questionIndex, option) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Calculate score and prepare results array
    let score = 0; // Initialize score
    const results = quiz.questions.map(([questionText, answerOptions, correctAnswer, explanation, type], index) => {
      const userAnswer = answers[index] || ''; // Get the user's answer for this question
      if (userAnswer === correctAnswer) score += 1; // Increment score for correct answers

      return {
        questionText,
        answerOptions,
        correctAnswer,
        userAnswer,
        explanation,
        type, // Add type for categorization
      };
    });

    // Navigate to results page with calculated score and results
    navigate(`/quiz_results/${quiz.id}`, {
      state: { score, total: quiz.questions.length, results }, // Pass score, total, and results
    });
  };

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
        <h2>{quiz.title}</h2>
        <form onSubmit={handleSubmit}>
          {quiz.questions.map((question_data, i) => (
            <div className="quiz-question" key={i}>
              <p><strong>{question_data[0]}</strong></p>
              {question_data[1].map((option, j) => (
                <label className="option" key={j}>
                  <input 
                    type="radio"
                    name={`q${i}`}
                    value={option}
                    required
                    onChange={() => handleOptionChange(i, option)}
                  />
                  {option}
                </label>
              ))}
              <br />
            </div>
          ))}
          <button type="submit">Submit Quiz</button>
        </form>
      </div>
    </div>
  );
};

export default Quiz;