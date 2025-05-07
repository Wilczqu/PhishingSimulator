import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const UserResults = ({ user }) => {
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserResults = async () => {
      try {
        if (!user || !user.id) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        
        console.log('Fetching quiz results for user ID:', user.id);
        const response = await axios.get(`/api/users/${user.id}/quiz-results`);
        console.log('Received quiz results:', response.data);
        setQuizResults(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz results:', error);
        setError('Failed to load your quiz results. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUserResults();
  }, [user]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div>
      <Navbar activePage="results" user={user} />
      
      <div className="container mt-4">
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">Your Quiz Results</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : quizResults.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Date Taken</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.map(result => (
                      <tr key={result.id}>
                        <td>{result.quiz?.title || 'Unknown Quiz'}</td>
                        <td>{formatDate(result.completedAt)}</td>
                        <td>{result.score}/{result.totalQuestions}</td>
                        <td>
                          <span className={`badge ${result.passed ? 'bg-success' : 'bg-danger'}`}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td>
                          <Link to={`/quiz_results/${result.quizId}?resultId=${result.id}`} className="btn btn-sm btn-outline-primary">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">You haven't taken any quizzes yet.</p>
            )}
          </div>
        </div>
        
        <div className="text-center mt-4">
          <Link to="/quizzes" className="btn btn-primary">Take a Quiz</Link>
        </div>
      </div>
    </div>
  );
};

export default UserResults;