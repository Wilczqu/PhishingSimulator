// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Dashboard = ({ username }) => {
  const [quiz1Visible, setQuiz1Visible] = useState(false);
  const [quiz2Visible, setQuiz2Visible] = useState(false);

  const toggleQuiz1 = () => setQuiz1Visible(!quiz1Visible);
  const toggleQuiz2 = () => setQuiz2Visible(!quiz2Visible);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle submission of quiz answers (e.g., send to API)
  };

  return (
    <div className="container">
      <h2>Welcome, {username}!</h2>
      <p><Link to="/logout">Logout</Link></p>

      <h3>Phishing Training Quizzes</h3>
      <form onSubmit={handleSubmit}>
        <button type="button" onClick={toggleQuiz1}>Quiz 1: Email Phishing</button>
        {quiz1Visible && (
          <div id="quiz1">
            <p>What is a common sign of a phishing email?</p>
            <label>
              <input type="radio" name="quiz1" value="A" /> A. An email from a known contact
            </label>
            <br />
            <label>
              <input type="radio" name="quiz1" value="B" /> B. A sense of urgency and suspicious links
            </label>
            <br />
            <label>
              <input type="radio" name="quiz1" value="C" /> C. A long and informative email
            </label>
            <br />
          </div>
        )}

        <button type="button" onClick={toggleQuiz2}>Quiz 2: Website Spoofing</button>
        {quiz2Visible && (
          <div id="quiz2">
            <p>How can you spot a fake website?</p>
            <label>
              <input type="radio" name="quiz2" value="A" /> A. It has a long URL
            </label>
            <br />
            <label>
              <input type="radio" name="quiz2" value="B" /> B. The website has no images
            </label>
            <br />
            <label>
              <input type="radio" name="quiz2" value="C" /> C. The URL doesn't match the legitimate site
            </label>
            <br />
          </div>
        )}
        <button type="submit">Submit Quiz</button>
      </form>
    </div>
  );
};

export default Dashboard;
