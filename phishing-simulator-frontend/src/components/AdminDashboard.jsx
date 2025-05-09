import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
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
import { Table, Button } from 'react-bootstrap'; // Import Table and Button from react-bootstrap

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
  const [users, setUsers] = useState([]); // State to store users

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

        // Fetch overall stats - FIXED: Using the correct endpoint
        const statsResponse = await axios.get('/api/stats/overall');
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

        // Fetch quiz stats - FIXED: Using the correct endpoint
        const quizStatsResponse = await axios.get('/api/stats/quizzes');
        setQuizStats({
          totalAttempts: quizStatsResponse.data.reduce((sum, quiz) => sum + (quiz.attempts || 0), 0),
          passCount: quizStatsResponse.data.reduce((sum, quiz) => sum + (quiz.passed || 0), 0),
          failCount: quizStatsResponse.data.reduce((sum, quiz) => sum + ((quiz.attempts || 0) - (quiz.passed || 0)), 0)
        });

        // Update quizzes with stats data
        setQuizzes(prevQuizzes => 
          prevQuizzes.map(quiz => {
            const quizWithStats = quizStatsResponse.data.find(q => q.id === quiz.id) || {};
            return {
              ...quiz,
              attempts: quizWithStats.attempts || 0,
              passed: quizWithStats.passed || 0
            };
          })
        );

        // Fetch users
        const usersResponse = await axios.get('/api/users');
        setUsers(usersResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); 

  const handlePromoteToAdmin = async (userId) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: 'admin' });
      // Update the user's role in the local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, role: 'admin' } : u
        )
      );
      alert('User promoted to admin!');
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user');
    }
  };

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
      <Navbar activePage="admin" user={user} />
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
                        <td><Link to={`/campaign/${campaign.id}`}>{campaign.name}</Link></td>
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
              <Link to="/quizzes" className="btn btn-sm btn-primary">Manage Quizzes</Link>
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
                        <td><Link to={`/quiz/${quiz.id}`}>{quiz.title}</Link></td>
                        <td>{quiz.attempts || 0}</td>
                        <td>
                          {quiz.attempts > 0 ? 
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

      {/* Users Table */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">Registered Users</div>
            <div className="card-body">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Last Login</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                      <td>{user.role}</td>
                      <td>
                        {user.role !== 'admin' && (
                          <Button variant="success" onClick={() => handlePromoteToAdmin(user.id)}>
                            Promote to Admin
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;