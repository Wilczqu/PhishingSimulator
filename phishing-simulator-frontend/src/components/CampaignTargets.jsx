import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { Container, Alert, Spinner, Button, Form, Table } from 'react-bootstrap';

const CampaignTargets = ({ user }) => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [allTargets, setAllTargets] = useState([]);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch campaign details
        const campaignResponse = await axios.get(`/api/campaigns/${id}`);
        setCampaign(campaignResponse.data);
        
        // Get IDs of targets already in the campaign
        const existingTargetIds = campaignResponse.data.results?.map(
          result => result.target?.id
        ).filter(id => id) || [];
        
        // Fetch all available targets
        const targetsResponse = await axios.get('/api/targets');
        setAllTargets(targetsResponse.data);
        
        // Set initially selected targets
        setSelectedTargets(existingTargetIds);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleTargetSelection = (targetId) => {
    setSelectedTargets(prev => {
      if (prev.includes(targetId)) {
        return prev.filter(id => id !== targetId);
      } else {
        return [...prev, targetId];
      }
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`/api/campaigns/${id}/targets`, { targetIds: selectedTargets });
      setSuccessMessage('Campaign targets updated successfully');
    } catch (err) {
      console.error('Error updating targets:', err);
      setError('Failed to update targets');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar activePage="campaigns" user={user} />
        <Container className="mt-4 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  return (
    <div>
      <Navbar activePage="campaigns" user={user} />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage Targets for {campaign?.name}</h2>
          <Link to={`/campaign/${id}`} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left"></i> Back to Campaign
          </Link>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

        <Form>
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-2">
              <h5>Select Targets</h5>
              <div>
                <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => setSelectedTargets([])}>
                  Deselect All
                </Button>
                <Button size="sm" variant="outline-primary" onClick={() => setSelectedTargets(allTargets.map(t => t.id))}>
                  Select All
                </Button>
              </div>
            </div>

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {allTargets.map(target => (
                  <tr key={target.id}>
                    <td className="text-center">
                      <Form.Check 
                        type="checkbox"
                        checked={selectedTargets.includes(target.id)}
                        onChange={() => handleTargetSelection(target.id)}
                      />
                    </td>
                    <td>{target.name}</td>
                    <td>{target.email}</td>
                    <td>{target.department}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={handleSubmit}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default CampaignTargets;