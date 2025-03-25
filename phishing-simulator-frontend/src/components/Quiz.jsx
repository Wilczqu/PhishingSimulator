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
    // Submit answers via an API call or handle locally
    navigate(`/quiz_results/${quiz.id}`, { state: { answers } });
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
