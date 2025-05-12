import React,  { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import  { Container, Row, Col, Card, Badge, Table, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import  { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import EmailPreview from './EmailPreview';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to calculate time difference in minutes
const timeDiffInMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
  return Math.round(diff / (1000 * 60));
};

const CampaignDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [targets, setTargets] = useState([]);
  const [availableTargets, setAvailableTargets] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentTargetForPreview, setCurrentTargetForPreview] = useState(null); // target object

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get campaign details
        const campaignRes = await axios.get(`/api/campaigns/${id}`);
        setCampaign(campaignRes.data);
        
        // Get campaign targets
        const targetsRes = await axios.get(`/api/campaigns/${id}/targets`);
        setTargets(targetsRes.data);
        
        // Get available targets for assignment
        const allTargetsRes = await axios.get('/api/targets');
        
        // Filter out targets already assigned to this campaign
        const assignedTargetIds = targetsRes.data.map(t => t.id);
        const filtered = allTargetsRes.data.filter(t => !assignedTargetIds.includes(t.id));
        setAvailableTargets(filtered);
        
        // Add user info to targets
        if (user && user.username) {
          console.log(`Campaign being viewed by: ${user.username}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching campaign details:', err);
        setError('Failed to load campaign details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchCampaignDetails();
  }, [id, user]);

  const campaignStats = useMemo(() => {
    if (!campaign || !campaign.results) {
      return {
        totalTargets: 0,
        emailsSent: 0, // Assuming all results mean an email was intended/sent
        emailsOpened: 0,
        linksClicked: 0,
        credentialsSubmitted: 0,
        submissionRate: 0,
        clickRate: 0,
        conversionRate: 0,
        detailedResults: [],
        timeToClickData: { labels: [], data: [] },
        departmentPerformanceData: { labels: [], data: [] },
      };
    }

    const results = campaign.results;
    const totalTargets = results.length;
    const emailsSent = totalTargets; // Or a more specific count if available
    const emailsOpened = results.filter(r => r.email_opened).length;
    const linksClicked = results.filter(r => r.link_clicked).length;
    const credentialsSubmitted = results.filter(r => r.credentials_submitted).length;

    const submissionRate = totalTargets > 0 ? (credentialsSubmitted / totalTargets) * 100 : 0;
    const clickRate = totalTargets > 0 ? (linksClicked / totalTargets) * 100 : 0;
    const conversionRate = linksClicked > 0 ? (credentialsSubmitted / linksClicked) * 100 : 0;

    // Time to Click Data (Histogram-like)
    const clickTimes = results
      .map(r => timeDiffInMinutes(campaign.sent_at || r.createdAt, r.clicked_at)) // Use campaign.sent_at or result.createdAt as baseline
      .filter(time => time !== null && time >= 0);
    
    const timeToClickBins = { '0-5 min': 0, '6-15 min': 0, '16-30 min': 0, '31-60 min': 0, '>60 min': 0 };
    clickTimes.forEach(time => {
      if (time <= 5) timeToClickBins['0-5 min']++;
      else if (time <= 15) timeToClickBins['6-15 min']++;
      else if (time <= 30) timeToClickBins['16-30 min']++;
      else if (time <= 60) timeToClickBins['31-60 min']++;
      else timeToClickBins['>60 min']++;
    });

    // Department Performance Data
    const departmentStats = {};
    results.forEach(r => {
      const dept = r.target?.department || 'Unknown';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { total: 0, submitted: 0 };
      }
      departmentStats[dept].total++;
      if (r.credentials_submitted) {
        departmentStats[dept].submitted++;
      }
    });
    const departmentPerformanceData = {
      labels: Object.keys(departmentStats),
      data: Object.values(departmentStats).map(dept => dept.total > 0 ? (dept.submitted / dept.total) * 100 : 0),
      counts: Object.values(departmentStats).map(dept => `(${dept.submitted}/${dept.total})`)
    };


    return {
      totalTargets,
      emailsSent,
      emailsOpened,
      linksClicked,
      credentialsSubmitted,
      submissionRate: submissionRate.toFixed(1),
      clickRate: clickRate.toFixed(1),
      conversionRate: conversionRate.toFixed(1),
      detailedResults: results,
      timeToClickData: {
        labels: Object.keys(timeToClickBins),
        data: Object.values(timeToClickBins),
      },
      departmentPerformanceData,
    };
  }, [campaign]);

  const submissionPieData = {
    labels: ['Submitted', 'Did Not Submit'],
    datasets: [{
      data: [campaignStats.credentialsSubmitted, campaignStats.totalTargets - campaignStats.credentialsSubmitted],
      backgroundColor: ['#dc3545', '#e9ecef'],
      hoverBackgroundColor: ['#c82333', '#d6d8db'],
    }],
  };

  const timeToClickChartData = {
    labels: campaignStats.timeToClickData.labels,
    datasets: [{
      label: 'Number of Users',
      data: campaignStats.timeToClickData.data,
      backgroundColor: '#007bff',
    }],
  };
  
  const departmentChartData = {
    labels: campaignStats.departmentPerformanceData.labels,
    datasets: [{
      label: 'Submission Rate (%)',
      data: campaignStats.departmentPerformanceData.data,
      backgroundColor: '#dc3545', // Red color for submission rate
      borderColor: '#c82333',
      borderWidth: 1,
      // You can add another dataset for total counts if desired, or display counts as labels
    }],
  };
   const departmentChartOptions = {
    indexAxis: 'y', // For horizontal bar chart if many departments
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Submission Rate (%)' }
      },
      y: {
        ticks: {
          // To show counts like (submitted/total) next to department names
          callback: function(value, index) {
            const label = campaignStats.departmentPerformanceData.labels[index];
            const counts = campaignStats.departmentPerformanceData.counts[index];
            return `${label} ${counts || ''}`;
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    }
  };


  const handleTargetPreview = (targetResult) => {
    if (campaign && campaign.template_name && targetResult && targetResult.unique_token) {
      const templateNameForUrl = campaign.template_name.toLowerCase().replace(/\s+/g, '-');
      const previewUrl = `/phish/${templateNameForUrl}/${targetResult.unique_token}`;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Preview not available.');
    }
  };

  const handleLaunchCampaign = async () => {
    if (window.confirm('Are you sure you want to launch this campaign? This will send phishing emails to all assigned targets.')) {
      try {
        setLoading(true);
        const response = await axios.post(`/api/campaigns/${id}/launch`);
        // Refresh campaign data
        const updatedCampaign = await axios.get(`/api/campaigns/${id}`);
        setCampaign(updatedCampaign.data);
        setLoading(false);
        // Show success message
        setSuccess('Campaign launched successfully!');
        setTimeout(() => setSuccess(null), 3000); // Changed from setSuccess('')
      } catch (err) {
        console.error('Error launching campaign:', err);
        setError(err.response?.data?.message || 'Failed to launch campaign.');
        setLoading(false);
      }
    }
  };

  const handlePreviewClick = (target) => { // Assuming target is the full target object
    setSelectedTargetId(target.id); // Still needed for the API call if EmailPreview doesn't get full target
    setCurrentTargetForPreview(target); // Store the target object
    setShowEmailPreview(true);
  };

  const handleDeleteCampaign = async () => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        setLoading(true);
        await axios.delete(`/api/campaigns/${id}`);
        navigate('/campaigns');
      } catch (err) {
        console.error('Error deleting campaign:', err);
        setError('Failed to delete campaign. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleAssignTargets = async () => {
    try {
      if (selectedTargets.length === 0) {
        setError('Please select at least one target');
        return;
      }
      
      setLoading(true);
      await axios.post(`/api/campaigns/${id}/targets`, {
        targetIds: selectedTargets
      });
      
      // Refresh targets list
      const targetsRes = await axios.get(`/api/campaigns/${id}/targets`);
      setTargets(targetsRes.data);
      
      // Update available targets
      const allTargetsRes = await axios.get('/api/targets');
      const assignedTargetIds = targetsRes.data.map(t => t.id);
      const filtered = allTargetsRes.data.filter(t => !assignedTargetIds.includes(t.id));
      setAvailableTargets(filtered);
      
      setSuccess('Targets assigned successfully!');
      setSelectedTargets([]);
      setShowAssignModal(false);
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error assigning targets:', err);
      setError('Failed to assign targets. Please try again.');
      setLoading(false);
    }
  };

  const handleTargetSelection = (e) => {
    const targetId = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedTargets([...selectedTargets, targetId]);
    } else {
      setSelectedTargets(selectedTargets.filter(id => id !== targetId));
    }
  };

  if (loading && !campaign) {
    return (
      <div className="container mt-4">
        <Navbar activePage="campaigns" user={user} />
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="container mt-4">
        <Navbar activePage="campaigns" user={user} />
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="outline-primary" onClick={() => navigate('/campaigns')}>
              Back to Campaigns
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (loading) return <Container className="mt-4 text-center"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!campaign) return <Container className="mt-4"><Alert variant="warning">Campaign not found.</Alert></Container>;

  return (
    <Container className="mt-4">
      <Navbar activePage="campaigns" user={user} />
      
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Campaign Details: {campaign?.name}</h5>
          <div>
            {campaign?.status === 'draft' && (
              <Button variant="success" size="sm" className="me-2" onClick={handleLaunchCampaign} disabled={targets.length === 0}>
                <i className="bi bi-rocket"></i> Launch Campaign
              </Button>
            )}
            {campaign?.status === 'active' || campaign?.status === 'completed' ? (
              <Link to={`/campaign/${id}/report`} className="btn btn-sm btn-info me-2">
                <i className="bi bi-bar-chart"></i> View Report
              </Link>
            ) : null}
            <Button variant="danger" size="sm" onClick={handleDeleteCampaign}>
              <i className="bi bi-trash"></i> Delete Campaign
            </Button>
          </div>
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <h6 className="fw-bold">Campaign Information</h6>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: '40%' }}>Name:</td>
                    <td>{campaign?.name}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Template:</td>
                    <td>{campaign?.template}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Subject:</td>
                    <td>{campaign?.subject}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Created:</td>
                    <td>{new Date(campaign?.createdAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Status:</td>
                    <td>
                      {campaign?.status === 'draft' ? (
                        <Badge bg="warning">Draft</Badge>
                      ) : campaign?.status === 'active' ? (
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="secondary">Completed</Badge>
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            
            <Col md={6}>
              <h6 className="fw-bold">Email Preview</h6>
              <Card>
                <Card.Body>
                  <p><strong>Subject:</strong> {campaign?.subject}</p>
                  <p><strong>From:</strong> Microsoft Office 365 &lt;security@microsoft-office365.com&gt;</p>
                  <p><strong>Template:</strong> {campaign?.template}</p>
                  <p className="text-muted">Click the "Preview Email" button next to any target to see the complete phishing email.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Campaign Targets</h6>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={() => setShowAssignModal(true)}
              disabled={campaign?.status !== 'draft' || availableTargets.length === 0}
            >
              <i className="bi bi-plus-circle"></i> Assign Targets
            </Button>
          </div>
          
          {targets.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map(target => (
                    <tr key={target.id}>
                      <td>{target.name}</td>
                      <td>{target.email}</td>
                      <td>{target.department || 'N/A'}</td>
                      <td>
                        {target.credentials_submitted ? (
                          <Badge bg="danger">Credentials Submitted</Badge>
                        ) : target.link_clicked ? (
                          <Badge bg="warning">Link Clicked</Badge>
                        ) : target.email_sent ? (
                          <Badge bg="info">Email Sent</Badge>
                        ) : (
                          <Badge bg="secondary">Pending</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handlePreviewClick(target)}
                        >
                          <i className="bi bi-envelope"></i> Preview Email
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              No targets assigned to this campaign yet. 
              {campaign?.status === 'draft' && (
                <Button 
                  variant="link" 
                  className="p-0 ms-2" 
                  onClick={() => setShowAssignModal(true)}
                  disabled={availableTargets.length === 0}
                >
                  Assign targets now
                </Button>
              )}
            </Alert>
          )}
        </Card.Body>
      </Card>
      
      {/* Assign Targets Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Assign Targets to Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {availableTargets.length === 0 ? (
            <Alert variant="info">
              No more targets available for assignment. <Link to="/targets">Create new targets</Link>
            </Alert>
          ) : (
            <>
              <Form>
                <div className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="select-all"
                    label="Select All"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTargets(availableTargets.map(t => t.id));
                      } else {
                        setSelectedTargets([]);
                      }
                    }}
                    checked={selectedTargets.length === availableTargets.length && availableTargets.length > 0}
                  />
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {availableTargets.map(target => (
                    <div key={target.id} className="mb-2">
                      <Form.Check 
                        type="checkbox"
                        id={`target-${target.id}`}
                        label={`${target.name} (${target.email}) ${target.department ? `- ${target.department}` : ''}`}
                        value={target.id}
                        onChange={handleTargetSelection}
                        checked={selectedTargets.includes(target.id)}
                      />
                    </div>
                  ))}
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssignTargets} 
            disabled={selectedTargets.length === 0 || loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-1">Assigning...</span>
              </>
            ) : (
              `Assign ${selectedTargets.length} Target${selectedTargets.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Email Preview Modal */}
      <EmailPreview 
        campaignId={id} // campaignId
        targetId={selectedTargetId} // targetId
        show={showEmailPreview}
        onHide={() => { setShowEmailPreview(false); setCurrentTargetForPreview(null); }}
        campaignSubjectProp={campaign?.subject}
        targetNameProp={currentTargetForPreview?.name}
      />
    </Container>
  );
};

export default CampaignDetail;