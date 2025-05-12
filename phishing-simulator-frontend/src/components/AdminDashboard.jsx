import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
// ProgressBar removed from imports as it's not used in the provided JSX
import { Table, Button, Card, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';

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
  // const [campaigns, setCampaigns] = useState([]); // Removed: allCampaignsWithStats is used for recent campaigns
  const [stats, setStats] = useState({
    totalTargets: 0,
    totalCampaigns: 0,
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
  const [users, setUsers] = useState([]);
  const [quizResults, setQuizResults] = useState([]); // Kept as user has it
  const [successMessage, setSuccessMessage] = useState('');
  const [allCampaignsWithStats, setAllCampaignsWithStats] = useState([]);
  const [dataLoadStatus, setDataLoadStatus] = useState({
    // campaigns: false, // Removed this as the specific fetch is removed
    allCampaigns: false, // Added to track the main campaigns fetch
    stats: false,
    quizzes: false,
    users: false,
    results: false // For quizResults
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setDataLoadStatus({ // Reset status on new fetch
        allCampaigns: false,
        stats: false,
        quizzes: false,
        users: false,
        results: false
      });

      if (!user || user.role !== 'admin') {
        setLoading(false);
        setError("Unauthorized access");
        navigate('/login'); // Redirect if not admin or user object is missing
        return;
      }

      try {
        // Removed fetch for /api/campaigns/recent as it's redundant

        // Fetch all campaigns with stats
        try {
          console.log("Fetching all campaigns...");
          const allCampaignsResponse = await axios.get('/api/campaigns');
          console.log("All campaigns response:", allCampaignsResponse.data);
          
          const processedCampaigns = allCampaignsResponse.data.map(campaign => {
            const emailsSent = campaign.emails_sent_count || 0;
            const emailsOpened = campaign.emails_opened_count || 0;
            const linksClicked = campaign.links_clicked_count || 0;
            const credentialsSubmitted = campaign.credentials_submitted_count || 0;
            
            return {
              ...campaign,
              open_rate: emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) : "0.0",
              click_rate: emailsOpened > 0 ? ((linksClicked / emailsOpened) * 100).toFixed(1) : "0.0", // Assuming click rate is based on opened emails
              submission_rate: linksClicked > 0 ? ((credentialsSubmitted / linksClicked) * 100).toFixed(1) : "0.0"
            };
          });
          
          setAllCampaignsWithStats(processedCampaigns);
          setDataLoadStatus(prev => ({...prev, allCampaigns: true}));
        } catch (err) {
          console.error('Error fetching all campaigns:', err);
          setAllCampaignsWithStats([]); // Set to empty array on error
        }

        // Fetch overall stats
        try {
          console.log("Fetching overview stats...");
          const statsResponse = await axios.get('/api/stats/overview');
          console.log("Stats response:", statsResponse.data);
          setStats({
            totalTargets: Number(statsResponse.data.totalTargets || 0),
            totalCampaigns: Number(statsResponse.data.totalCampaigns || 0),
            emailsSent: Number(statsResponse.data.emailsSent || 0),
            emailsOpened: Number(statsResponse.data.emailsOpened || 0),
            linksClicked: Number(statsResponse.data.linksClicked || 0),
            credentialsSubmitted: Number(statsResponse.data.credentialsSubmitted || 0)
          });
          setDataLoadStatus(prev => ({...prev, stats: true}));
        } catch (err) {
          console.error('Error fetching stats:', err);
        }

        // Fetch quizzes and quiz stats
        try {
          console.log("Fetching quizzes...");
          const quizzesResponse = await axios.get('/api/quizzes');
          console.log("Quizzes response:", quizzesResponse.data);
          // setQuizzes(quizzesResponse.data); // Initial set
          
          console.log("Fetching quiz stats...");
          const quizStatsResponse = await axios.get('/api/stats/quizzes');
          console.log("Quiz stats response:", quizStatsResponse.data);
          
          const totalAttempts = quizStatsResponse.data.reduce((sum, quiz) => sum + parseInt(quiz.attempts || 0), 0);
          const passCount = quizStatsResponse.data.reduce((sum, quiz) => sum + parseInt(quiz.passed || 0), 0);
          
          setQuizStats({
            totalAttempts,
            passCount,
            failCount: totalAttempts - passCount
          });
          
          setQuizzes( // Update quizzes with their individual stats
            quizzesResponse.data.map(quiz => {
              const quizWithStats = quizStatsResponse.data.find(q => q.id === quiz.id) || {};
              return {
                ...quiz,
                attempts: parseInt(quizWithStats.attempts || 0),
                passed: parseInt(quizWithStats.passed || 0)
              };
            })
          );
          setDataLoadStatus(prev => ({...prev, quizzes: true}));
        } catch (err) {
          console.error('Error fetching quizzes or quiz stats:', err);
        }

        // Fetch users
        try {
          console.log("Fetching users...");
          const usersResponse = await axios.get('/api/admin/users');
          console.log("Users response:", usersResponse.data);
          setUsers(usersResponse.data);
          setDataLoadStatus(prev => ({...prev, users: true}));
        } catch (err) {
          console.error('Error fetching users from admin endpoint:', err);
          try {
            const usersResponseFallback = await axios.get('/api/users'); // Fallback
            setUsers(usersResponseFallback.data);
            setDataLoadStatus(prev => ({...prev, users: true})); // Still set status on fallback success
          } catch (fallbackErr) {
            console.error('Error fetching users from fallback endpoint:', fallbackErr);
            setUsers([]);
          }
        }

        // Fetch quiz results
        try {
          console.log("Fetching quiz results...");
          const quizResultsResponse = await axios.get('/api/quizzes/results/all');
          console.log("Quiz results response:", quizResultsResponse.data);
          setQuizResults(quizResultsResponse.data);
          setDataLoadStatus(prev => ({...prev, results: true}));
        } catch (err) {
          console.error('Error fetching from /api/quizzes/results/all:', err);
          try {
            const quizResultsResponseFallback = await axios.get('/api/quiz-results'); // Fallback
            setQuizResults(quizResultsResponseFallback.data);
            setDataLoadStatus(prev => ({...prev, results: true})); // Still set status on fallback success
          } catch (fallbackErr) {
            console.error('Error fetching quiz results from fallback endpoint:', fallbackErr);
            setQuizResults([]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('General error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data. Please check the server connection.');
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]); // Added navigate to dependency array

  // Enhanced user management functions
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setSuccessMessage(`User role updated successfully!`);
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(`Failed to update user role: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setError(null), 3000); // Clear error after timeout
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
          await axios.delete(`/api/admin/users/${userId}`);
          setSuccessMessage(`User deleted successfully!`);
          setUsers(users.filter(u => u.id !== userId));
          setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
          console.error('Error deleting user:', error);
          setError(`Failed to delete user: ${error.response?.data?.message || error.message}`);
          setTimeout(() => setError(null), 3000); // Clear error after timeout
        }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateRate = (numerator, denominator) => {
    const num = Number(numerator || 0);
    const denom = Number(denominator || 0);
    if (denom <= 0) return "0.0";
    const rate = (num / denom * 100);
    return isNaN(rate) ? "0.0" : rate.toFixed(1);
  };

  const debugDataIssues = () => {
    console.group('AdminDashboard Data Debugging');
    console.log('Raw Stats:', stats);
    console.log('Raw Quiz Stats:', quizStats);
    console.log('All Campaigns with Stats:', allCampaignsWithStats);
    console.log('Users:', users);
    console.log('Quizzes:', quizzes);
    console.log('Quiz Results:', quizResults);
    console.log('Data Load Status:', dataLoadStatus);
    console.log('Calculated Rates:', { openRate, clickRate, submissionRate });
    console.log('Campaign Chart Data:', campaignChartData);
    console.log('Quiz Chart Data:', quizChartData);
    console.log('Submission Data for Pie Chart:', submissionData);
    console.groupEnd();
    return 'Data logged to console';
  };

  const openRate = calculateRate(stats.emailsOpened, stats.emailsSent);
  // Click rate can be based on emails opened or emails sent. 
  // Based on your previous `allCampaignsWithStats` processing, it was `linksClicked / emailsOpened`.
  const clickRate = calculateRate(stats.linksClicked, stats.emailsOpened); 
  const submissionRate = calculateRate(stats.credentialsSubmitted, stats.linksClicked);

  const campaignChartData = generateCampaignChartData(stats);
  const quizChartData = generateQuizChartData(quizStats);

  const submissionData = {
    labels: ['Submitted', 'Did Not Submit (from Clicked)'],
    datasets: [
      {
        label: 'Credential Submission Rate',
        data: [parseFloat(submissionRate) || 0, 100 - (parseFloat(submissionRate) || 0)],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)', // Red for submitted
          'rgba(220, 220, 220, 0.8)', // Grey for not submitted
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(220, 220, 220, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  if (loading) {
    return (
      <div className="container mt-5">
        <Navbar activePage="admin" user={user} />
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && error === "Unauthorized access") {
    // Redirect handled by useEffect, this is a fallback message area if needed
    return (
        <div className="container mt-5">
            <Navbar activePage="admin" user={user} />
            <Alert variant="danger">
                <Alert.Heading>Access Denied</Alert.Heading>
                <p>You do not have permission to view this page. You should be redirected to login.</p>
            </Alert>
        </div>
    );
  }
  
  if (error) { // For other errors
    return (
      <div className="container mt-5">
        <Navbar activePage="admin" user={user} />
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button onClick={() => window.location.reload()} variant="outline-danger">
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Navbar activePage="admin" user={user} />
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard, {user?.username || 'Admin'}!</p>
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Key Performance Metrics */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>
                <i className="bi bi-key-fill text-danger me-2"></i>
                {submissionRate}%
              </Card.Title>
              <Card.Text className="fw-bold">Credential Submission Rate</Card.Text>
              <Card.Text className="small text-muted">
                {stats.credentialsSubmitted} of {stats.linksClicked} link clicks resulted in submissions.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>
                <i className="bi bi-link-45deg text-warning me-2"></i>
                {clickRate}%
              </Card.Title>
              <Card.Text className="fw-bold">Link Click Rate</Card.Text>
              <Card.Text className="small text-muted">
                {stats.linksClicked} of {stats.emailsOpened} opened emails had links clicked.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>
                <i className="bi bi-envelope-open-fill text-info me-2"></i>
                {openRate}%
              </Card.Title>
              <Card.Text className="fw-bold">Email Open Rate</Card.Text>
              <Card.Text className="small text-muted">
                {stats.emailsOpened} of {stats.emailsSent} sent emails were opened.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header as="h5">Quick Actions</Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/campaigns/create" className="btn btn-primary"> {/* Assuming /campaigns/create or similar for direct creation */}
                  <i className="bi bi-plus-circle me-2"></i>Create Campaign
                </Link>
                <Link to="/targets" className="btn btn-success">
                  <i className="bi bi-people me-2"></i>Manage Targets
                </Link>
                <Link to="/quizzes" className="btn btn-info text-white">
                  <i className="bi bi-question-circle me-2"></i>Manage Quizzes
                </Link>
                <Button variant="outline-secondary" onClick={() => debugDataIssues()}>
                  <i className="bi bi-bug me-2"></i>Debug Data
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Campaign Statistics</Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                {stats.emailsSent > 0 || stats.emailsOpened > 0 || stats.linksClicked > 0 || stats.credentialsSubmitted > 0 ? (
                  <Bar data={campaignChartData} options={barChartOptions} />
                ) : (
                  <div className="text-center p-4 d-flex align-items-center justify-content-center h-100">
                    <p className="text-muted">No campaign data available yet.</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Quiz Statistics</Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                {quizStats.totalAttempts > 0 ? (
                  <Pie data={quizChartData} options={pieChartOptions} />
                ) : (
                  <div className="text-center p-4 d-flex align-items-center justify-content-center h-100">
                    <p className="text-muted">No quiz data available yet.</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Credential Submission Breakdown (from Clicked)</Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                {stats.linksClicked > 0 ? ( // Ensure there are clicks before showing this pie chart
                  <Pie data={submissionData} options={{
                    ...pieChartOptions,
                    plugins: {
                      ...pieChartOptions.plugins,
                      title: {
                        display: true,
                        text: 'Submission Rate from Clicked Emails'
                      }
                    }
                  }} />
                ) : (
                  <div className="text-center p-4 d-flex align-items-center justify-content-center h-100">
                    <p className="text-muted">No link click data available for submission breakdown.</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
         <Col md={6} className="d-flex align-items-center justify-content-end">
          <Link to="/reports" className="btn btn-outline-primary">
            <i className="bi bi-file-earmark-bar-graph me-2"></i> View All Campaign Reports
          </Link>
        </Col>
      </Row>

      {/* User Management Section */}
      <Card className="mt-4 mb-5">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">User Management</h5>
          <Link to="/user-management" className="btn btn-sm btn-outline-primary">
            <i className="bi bi-gear me-1"></i> Advanced User Management
          </Link>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover bordered>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map(uItem => ( // Renamed user to uItem to avoid conflict with prop
                  <tr key={uItem.id}>
                    <td>{uItem.username}</td>
                    <td>
                      <Badge bg={uItem.role === 'admin' ? 'danger' : 'info'}>
                        {uItem.role}
                      </Badge>
                    </td>
                    <td>{uItem.lastLogin ? formatDate(uItem.lastLogin) : 'Never'}</td>
                    <td>
                      <div className="btn-group">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleRoleChange(uItem.id, uItem.role === 'admin' ? 'user' : 'admin')}
                        >
                          {uItem.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteUser(uItem.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                 {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-3">No users found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          
          {users.length > 5 && (
            <div className="text-center mt-3">
              <Link to="/user-management" className="btn btn-link">
                View All {users.length} Users
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Recent Campaigns Section */}
      <Card className="mt-4 mb-5">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Campaigns</h5>
          <Link to="/campaigns" className="btn btn-sm btn-outline-primary">
            <i className="bi bi-list me-1"></i> View All Campaigns
          </Link>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover bordered>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Open Rate</th>
                  <th>Click Rate</th>
                  <th>Submission Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allCampaignsWithStats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(campaign => (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>
                      <Badge bg={
                        campaign.status === 'active' ? 'success' : 
                        campaign.status === 'draft' ? 'warning' : 'secondary'
                      }>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </td>
                    <td>{formatDate(campaign.createdAt)}</td>
                    <td>{campaign.open_rate || '0.0'}%</td>
                    <td>{campaign.click_rate || '0.0'}%</td>
                    <td>{campaign.submission_rate || '0.0'}%</td>
                    <td>
                      <Link to={`/campaign/${campaign.id}`} className="btn btn-sm btn-outline-info me-1">
                        <i className="bi bi-eye"></i> Details
                      </Link>
                      {(campaign.status === 'active' || campaign.status === 'completed') && (
                        <Link to={`/campaign/${campaign.id}/report`} className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-bar-chart"></i> Report
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {allCampaignsWithStats.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-3">No campaigns created yet.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          
          {allCampaignsWithStats.length > 5 && (
            <div className="text-center mt-3">
              <Link to="/campaigns" className="btn btn-link">
                View All {allCampaignsWithStats.length} Campaigns
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <div className="mt-3" style={{display: 'none'}}> {/* Hidden by default */}
        <h6>Data Load Status (Debug):</h6>
        <ul>
          <li>All Campaigns: {dataLoadStatus.allCampaigns ? '✅' : '❌'}</li>
          <li>Stats Overview: {dataLoadStatus.stats ? '✅' : '❌'}</li>
          <li>Quizzes & Quiz Stats: {dataLoadStatus.quizzes ? '✅' : '❌'}</li>
          <li>Users: {dataLoadStatus.users ? '✅' : '❌'}</li>
          <li>Quiz Results: {dataLoadStatus.results ? '✅' : '❌'}</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;