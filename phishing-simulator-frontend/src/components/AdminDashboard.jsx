// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; // Ensure you install react-chartjs-2 and chart.js
import '../App.css';

const AdminDashboard = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get('/api/quiz-results')
      .then(response => setResults(response.data))
      .catch(error => console.error('Error fetching results', error));
  }, []);

  // Prepare data for the chart
  const chartData = {
    labels: results.map(result => result.username),
    datasets: [
      {
        label: 'Quiz Scores',
        data: results.map(result => result.score),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="statistics">
        <Bar data={chartData} />
      </div>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Quiz Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result.id}>
              <td>{result.username}</td>
              <td>{result.score}</td>
              <td>{result.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
