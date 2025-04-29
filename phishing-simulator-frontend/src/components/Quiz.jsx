// src/components/Quiz.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Quiz = ({ user }) => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/api/quizzes/${quizId}`);
        setQuiz(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please try again later.");
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (questionIndex, option) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!quiz || !quiz.questions) return;

    // Calculate score and prepare results array
    let score = 0;
    const results = quiz.questions.map(([questionText, answerOptions, correctAnswer, explanation, type], index) => {
      const userAnswer = answers[index] || '';
      if (userAnswer === correctAnswer) score += 1;

      return {
        questionText,
        answerOptions,
        correctAnswer,
        userAnswer,
        explanation,
        type,
      };
    });

    // Submit result to backend if user is logged in
    if (user && user.id) {
      axios.post(`/api/quizzes/${quizId}/submit`, {
        userId: user.id,
        score,
        totalQuestions: quiz.questions.length,
        passed: score >= (quiz.questions.length / 2), // Pass if score is at least 50%
        answers: results
      }).catch(err => {
        console.error("Error submitting quiz result:", err);
      });
    }

    // Navigate to results page
    navigate(`/quiz_results/${quizId}`, {
      state: { score, total: quiz.questions.length, results },
    });
  };

  if (loading) return <div className="container">Loading quiz...</div>;
  if (error) return <div className="container">{error}</div>;
  if (!quiz) return <div className="container">Quiz not found.</div>;

  return (
    <div>
      <div className="container">
        <h2>{quiz.title}</h2>
        {quiz.description && <p>{quiz.description}</p>}
        
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
          <button type="submit" className="btn btn-primary">Submit Quiz</button>
        </form>
      </div>
    </div>
  );
};

export default Quiz;