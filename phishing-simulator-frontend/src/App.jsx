// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';
import Quizzes from './components/Quizzes';
import Result from './components/Result';
import AdminDashboard from './components/AdminDashboard'; // <-- Import AdminDashboard
import Logout from './components/Logout';

import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Dashboard username="User" />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/quiz/:quizId"
          element={
            <Quiz
              quiz={{
                id: 1,
                title: 'Sample Quiz',
                questions: [
                  ['What is phishing?', ['Scam', 'Fishing', 'Cooking'], 'Scam'],
                ],
              }}
            />
          }
        />
        <Route
          path="/quiz_results/:quizId"
          element={<QuizResults score={2} total={3} results={[]} />}
        />
        <Route
          path="/quizzes"
          element={<Quizzes quizzes={{ 1: 'Email Phishing', 2: 'Website Spoofing' }} />}
        />
        <Route path="/result" element={<Result score={2} total={3} resultText="passed" />} />

        {/* New Admin route */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
