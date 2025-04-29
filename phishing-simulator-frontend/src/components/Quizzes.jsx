// src/components/Quizzes.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Quizzes = ({ quizzes }) => {
  return (
    <div className="container">
      <h2>Select a Quiz</h2>
      <div className="row">
        {Array.isArray(quizzes) && quizzes.length > 0 ? (
          quizzes.map(quiz => (
            <div className="col-md-4 mb-4" key={quiz.id}>
              <div className="card custom-card h-100">
                <div className="card-body">
                  <h5 className="card-title">{quiz.title}</h5>
                  {quiz.description && <p className="card-text">{quiz.description}</p>}
                  <Link to={`/quiz/${quiz.id}`} className="btn btn-primary">
                    Take Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p>No quizzes available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
