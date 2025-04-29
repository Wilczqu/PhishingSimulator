import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { 
  generateCampaignChartData, 
  generateQuizChartData,
  barChartOptions,
  pieChartOptions 
} from '../utils/chartutil';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = ({ user }) => {
  // Move all useState calls to the top level, outside of any conditions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalTargets: 0,
    emailsSent: 0,
    emailsOpened: 0,
    linksClicked: 0,
    credentialsSubmitted: 0
  });
  const [quizzes, setQuizzes] = useState([]);
  const [quizStats, setQuizStats] = useState({
    totalAttempts: 0,
    passCount: 0,
    failCount: 0
  });

  // Use a single useEffect for all data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only proceed if user is logged in and is an admin
        if (!user || user.role !== 'admin') {
          setLoading(false);
          setError("Unauthorized access");
          return;
        }

        // Fetch campaigns
        const campaignsResponse = await axios.get('/api/campaigns/recent');
        setCampaigns(campaignsResponse.data);

        // Fetch overall stats
        const statsResponse = await axios.get('/api/stats');
        setStats({
          totalTargets: statsResponse.data.totalTargets || 0,
          emailsSent: statsResponse.data.emailsSent || 0,
          emailsOpened: statsResponse.data.emailsOpened || 0,
          linksClicked: statsResponse.data.linksClicked || 0,
          credentialsSubmitted: statsResponse.data.credentialsSubmitted || 0
        });

        // Fetch quizzes
        const quizzesResponse = await axios.get('/api/quizzes');
        setQuizzes(quizzesResponse.data);

        // Fetch quiz stats
        const quizStatsResponse = await axios.get('/api/quiz-stats');
        setQuizStats({
          totalAttempts: quizStatsResponse.data.totalAttempts || 0,
          passCount: quizStatsResponse.data.passCount || 0,
          failCount: quizStatsResponse.data.failCount || 0
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Add user as a dependency

  // Handle unauthorized or loading states
  if (loading) {
    return <div className="container mt-5"><h2>Loading dashboard data...</h2></div>;
  }

  if (error) {
    return <div className="container mt-5"><h2>Error: {error}</h2></div>;
  }

  // Charts data
  const campaignChartData = generateCampaignChartData(stats);
  const quizChartData = generateQuizChartData(quizStats);

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Targets</h5>
              <h2>{stats.totalTargets}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Emails Sent</h5>
              <h2>{stats.emailsSent}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">Links Clicked</h5>
              <h2>{stats.linksClicked}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">Credentials Submitted</h5>
              <h2>{stats.credentialsSubmitted}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              Campaign Statistics
            </div>
            <div className="card-body">
              <Bar data={campaignChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              Quiz Results
            </div>
            <div className="card-body">
              <Pie data={quizChartData} options={pieChartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Recent Campaigns</span>
              <Link to="/campaigns" className="btn btn-sm btn-primary">View All</Link>
            </div>
            <div className="card-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length > 0 ? (
                    campaigns.map(campaign => (
                      <tr key={campaign.id}>
                        <td><Link to={`/campaigns/${campaign.id}`}>{campaign.name}</Link></td>
                        <td>{campaign.status}</td>
                        <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No campaigns yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Quizzes</span>
              <Link to="/quizzes/manage" className="btn btn-sm btn-primary">Manage Quizzes</Link>
            </div>
            <div className="card-body">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Attempts</th>
                    <th>Pass Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.length > 0 ? (
                    quizzes.map(quiz => (
                      <tr key={quiz.id}>
                        <td><Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link></td>
                        <td>{quiz.attempts || 0}</td>
                        <td>
                          {quiz.attempts ? 
                            `${Math.round((quiz.passed / quiz.attempts) * 100)}%` : 
                            '0%'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3">No quizzes yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;