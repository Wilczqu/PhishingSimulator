import React, { useState, useEffect, useCallback } from 'react';
import  {useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import  { Container, Card, Button, Form, ListGroup, Spinner, Alert, Row, Col } from 'react-bootstrap';
import EmailPreview from './EmailPreview';

const CampaignTargets = ({ user }) => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [allTargets, setAllTargets] = useState([]);
  const [selectedTargetIds, setSelectedTargetIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  const fetchCampaignAndTargets = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Fetch campaign details to get its name and current results (which include targets)
      const campaignResponse = await axios.get(`/api/campaigns/${campaignId}`);
      setCampaign(campaignResponse.data);
      
      const currentTargetIds = new Set();
      if (campaignResponse.data && campaignResponse.data.results) {
        campaignResponse.data.results.forEach(result => {
          if (result.target_id) { // Ensure target_id exists
            currentTargetIds.add(result.target_id);
          }
        });
      }
      setSelectedTargetIds(currentTargetIds);

      // Fetch all available targets
      const allTargetsResponse = await axios.get('/api/targets');
      setAllTargets(allTargetsResponse.data);

    } catch (err) {
      console.error('Error fetching campaign or targets:', err);
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaignAndTargets();
  }, [fetchCampaignAndTargets]);

  const handleTargetSelectionChange = (targetId) => {
    setSelectedTargetIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(targetId)) {
        newSelectedIds.delete(targetId);
      } else {
        newSelectedIds.add(targetId);
      }
      return newSelectedIds;
    });
  };

  const handleSaveTargets = async () => {
    setError('');
    setSuccess('');
    try {
      const targetIdsArray = Array.from(selectedTargetIds);
      await axios.put(`/api/campaigns/${campaignId}/targets`, { targetIds: targetIdsArray });
      setSuccess('Campaign targets updated successfully!');
      // Optionally, refresh data or navigate
      setTimeout(() => {
        // navigate(`/campaign/${campaignId}`); // Or refresh
        fetchCampaignAndTargets(); // Refresh the selections
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Error updating campaign targets:', err);
      setError(err.response?.data?.message || 'Failed to update targets. Please ensure all selected targets exist.');
    }
  };

  const handlePreviewClick = (targetId) => {
    setSelectedTargetId(targetId);
    setShowEmailPreview(true);
  };

  if (loading) {
    return (
      <>
        <Navbar activePage="campaigns" user={user} />
        <Container className="mt-4 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading campaign and target data...</span>
          </Spinner>
          <p>Loading campaign and target data...</p>
        </Container>
      </>
    );
  }

  if (error && !campaign) { // Show critical error if campaign data couldn't be loaded
    return (
      <>
        <Navbar activePage="campaigns" user={user} />
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
          <Link to="/campaigns" className="btn btn-secondary">Back to Campaigns</Link>
        </Container>
      </>
    );
  }
  
  return (
    <>
      <Navbar activePage="campaigns" user={user} />
      <Container className="mt-4">
        <Row className="mb-3">
          <Col>
            <h2>Manage Targets for: {campaign?.name || 'Campaign'}</h2>
          </Col>
          <Col className="text-end">
            <Link to={`/campaign/${campaignId}`} className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left"></i> Back to Campaign Details
            </Link>
            <Button onClick={handleSaveTargets} variant="primary">
              <i className="bi bi-save"></i> Save Changes
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        <Card>
          <Card.Header>Select Targets</Card.Header>
          <Card.Body>
            {allTargets.length > 0 ? (
              <ListGroup>
                {allTargets.map(target => (
                  <ListGroup.Item key={target.id}>
                    <Form.Check 
                      type="checkbox"
                      id={`target-${target.id}`}
                      label={`${target.name} (${target.email})`}
                      checked={selectedTargetIds.has(target.id)}
                      onChange={() => handleTargetSelectionChange(target.id)}
                    />
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => handlePreviewClick(target.id)}
                    >
                      <i className="bi bi-eye"></i> Preview Email
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p>No targets available. Please <Link to="/targets">add targets</Link> first.</p>
            )}
          </Card.Body>
        </Card>
      </Container>
      <EmailPreview 
        campaignId={campaignId}
        targetId={selectedTargetId}
        show={showEmailPreview} 
        onHide={() => setShowEmailPreview(false)} 
      />
    </>
  );
};

export default CampaignTargets;