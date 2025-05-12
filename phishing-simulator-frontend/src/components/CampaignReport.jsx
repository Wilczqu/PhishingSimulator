import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import  { Container, Card, Row, Col, Table, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import  { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import Navbar from './Navbar';

const CampaignReport = ({ user }) => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    emailsSent: 0,
    emailsOpened: 0,
    linksClicked: 0,
    credentialsSubmitted: 0
  });
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Campaign Results'
      }
    }
  };

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching campaign data for ID: ${id}`);
        
        // Get campaign details
        const campaignRes = await axios.get(`/api/campaigns/${id}`);
        setCampaign(campaignRes.data);
        
        // Get campaign results
        const resultsRes = await axios.get(`/api/campaigns/${id}/results`);
        
        // Log the results for debugging
        console.log('Campaign results data:', resultsRes.data);
        setResults(resultsRes.data);
        
        // Calculate metrics from results
        if (Array.isArray(resultsRes.data)) {
          // Calculate metrics
          const sent = resultsRes.data.filter(r => r.email_sent).length;
          const opened = resultsRes.data.filter(r => r.email_opened).length;
          const clicked = resultsRes.data.filter(r => r.link_clicked).length;
          const submitted = resultsRes.data.filter(r => r.credentials_submitted).length;
          
          console.log('Calculated metrics:', { sent, opened, clicked, submitted });
          
          setMetrics({
            emailsSent: sent || 0,
            emailsOpened: opened || 0,
            linksClicked: clicked || 0,
            credentialsSubmitted: submitted || 0
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching campaign report:', err);
        setError('Failed to load campaign report: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };
    
    fetchCampaignData();
  }, [id]);
  
  // Calculate rates
  const calculateRate = (numerator, denominator) => {
    if (denominator === 0) return "0.0";
    return ((numerator / denominator) * 100).toFixed(1);
  };
  
  const openRate = calculateRate(metrics.emailsOpened, metrics.emailsSent);
  const clickRate = calculateRate(metrics.linksClicked, metrics.emailsSent);
  const submissionRate = calculateRate(metrics.credentialsSubmitted, metrics.emailsSent);
  
  // Chart data
  const barData = {
    labels: ['Sent', 'Opened', 'Clicked', 'Credentials'],
    datasets: [
      {
        label: 'Count',
        data: [metrics.emailsSent, metrics.emailsOpened, metrics.linksClicked, metrics.credentialsSubmitted],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const pieData = {
    labels: ['Opened', 'Not Opened'],
    datasets: [
      {
        label: 'Emails',
        data: [metrics.emailsOpened, metrics.emailsSent - metrics.emailsOpened],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Navbar activePage="campaigns" user={user} />
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading campaign report...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Navbar activePage="campaigns" user={user} />
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Navbar activePage="campaigns" user={user} />
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Campaign Report: {campaign?.name}</h5>
          <div>
            <Link to="/campaigns" className="btn btn-sm btn-outline-primary">
              <i className="bi bi-arrow-left"></i> Back to Campaigns
            </Link>
          </div>
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h6 className="fw-bold">Campaign Information</h6>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td className="text-muted">Name:</td>
                        <td>{campaign?.name}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Template:</td>
                        <td>{campaign?.template}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Status:</td>
                        <td>
                          <Badge bg={
                            campaign?.status === 'active' ? 'success' : 
                            campaign?.status === 'draft' ? 'warning' : 'secondary'
                          }>
                            {campaign?.status}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Created:</td>
                        <td>{new Date(campaign?.createdAt).toLocaleDateString()}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h6 className="fw-bold">Key Metrics</h6>
                  <Row>
                    <Col xs={6} md={4} className="text-center mb-3">
                      <div className="fs-4 fw-bold text-primary">{openRate}%</div>
                      <div className="text-muted small">Open Rate</div>
                    </Col>
                    <Col xs={6} md={4} className="text-center mb-3">
                      <div className="fs-4 fw-bold text-warning">{clickRate}%</div>
                      <div className="text-muted small">Click Rate</div>
                    </Col>
                    <Col xs={6} md={4} className="text-center mb-3">
                      <div className="fs-4 fw-bold text-danger">{submissionRate}%</div>
                      <div className="text-muted small">Submission Rate</div>
                    </Col>
                    <Col xs={6} md={4} className="text-center">
                      <div className="fs-4 fw-bold">{metrics.emailsSent}</div>
                      <div className="text-muted small">Emails Sent</div>
                    </Col>
                    <Col xs={6} md={4} className="text-center">
                      <div className="fs-4 fw-bold">{metrics.emailsOpened}</div>
                      <div className="text-muted small">Emails Opened</div>
                    </Col>
                    <Col xs={6} md={4} className="text-center">
                      <div className="fs-4 fw-bold">{metrics.credentialsSubmitted}</div>
                      <div className="text-muted small">Credentials Submitted</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>Campaign Statistics</Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Bar data={barData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card>
                <Card.Header>Email Open Rate</Card.Header>
                <Card.Body>
                  <div style={{ height: '300px' }}>
                    <Pie data={pieData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Card>
            <Card.Header>Target Results</Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td>{result.target?.name || 'N/A'}</td>
                        <td>{result.target?.email || 'N/A'}</td>
                        <td>{result.target?.department || 'N/A'}</td>
                        <td>
                          {result.credentials_submitted ? (
                            <Badge bg="danger">Credentials Submitted</Badge>
                          ) : result.link_clicked ? (
                            <Badge bg="warning">Link Clicked</Badge>
                          ) : result.email_opened ? (
                            <Badge bg="info">Email Opened</Badge>
                          ) : result.email_sent ? (
                            <Badge bg="primary">Email Sent</Badge>
                          ) : (
                            <Badge bg="secondary">Pending</Badge>
                          )}
                        </td>
                        <td>
                          {result.email_sent && (
                            <div className="small">
                              {result.email_sent && <div>Email Sent: {new Date(result.createdAt).toLocaleString()}</div>}
                              {result.email_opened && <div>Email Opened: {new Date(result.opened_at || result.updatedAt).toLocaleString()}</div>}
                              {result.link_clicked && <div>Link Clicked: {new Date(result.clicked_at || result.updatedAt).toLocaleString()}</div>}
                              {result.credentials_submitted && <div>Credentials Submitted: {new Date(result.submitted_at || result.updatedAt).toLocaleString()}</div>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-3">
                          No results available for this campaign.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CampaignReport;