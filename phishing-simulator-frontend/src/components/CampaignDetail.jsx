import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { Container, Row, Col, Card, Badge, Table, Spinner, Alert, Button } from 'react-bootstrap';

const CampaignDetail = ({ user }) => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const response = await axios.get(`/api/campaigns/${id}`);
        setCampaign(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching campaign details:', err);
        
        // Try the simpler API as a fallback (without results included)
        try {
          const simpleResponse = await axios.get(`/api/campaigns/${id}/basic`);
          setCampaign({
            ...simpleResponse.data,
            results: [] // Provide empty results array
          });
          setLoading(false);
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
          setError('Failed to load campaign details');
          setLoading(false);
        }
      }
    };

    fetchCampaignDetails();
  }, [id]);

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

  if (error) {
    return (
      <div>
        <Navbar activePage="campaigns" user={user} />
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div>
        <Navbar activePage="campaigns" user={user} />
        <Container className="mt-4">
          <Alert variant="warning">Campaign not found</Alert>
        </Container>
      </div>
    );
  }

  // Calculate statistics based on results
  const results = campaign.results || [];
  const totalTargets = results.length;
  const emailsSent = results.filter(r => r.email_sent).length;
  const emailsOpened = results.filter(r => r.email_opened).length;
  const linksClicked = results.filter(r => r.link_clicked).length;
  const credentialsSubmitted = results.filter(r => r.credentials_submitted).length;

  return (
    <div>
      <Navbar activePage="campaigns" user={user} />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>{campaign.name}</h2>
            <Badge bg={
              campaign.status === 'active' ? 'success' : 
              campaign.status === 'scheduled' ? 'info' : 
              campaign.status === 'completed' ? 'secondary' : 'warning'
            }>
              {campaign.status}
            </Badge>
          </div>
          <div>
            <Link to="/campaigns" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left"></i> Back to Campaigns
            </Link>
            <Link to={`/campaign/${id}/targets`} className="btn btn-primary">
              <i className="bi bi-people"></i> Manage Targets
            </Link>
          </div>
        </div>

        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <Card.Header>Campaign Details</Card.Header>
              <Card.Body>
                <Table borderless>
                  <tbody>
                    <tr>
                      <th width="30%">Subject</th>
                      <td>{campaign.subject}</td>
                    </tr>
                    <tr>
                      <th>Sender Name</th>
                      <td>{campaign.sender_name}</td>
                    </tr>
                    <tr>
                      <th>Sender Email</th>
                      <td>{campaign.sender_email}</td>
                    </tr>
                    <tr>
                      <th>Created</th>
                      <td>{new Date(campaign.createdAt).toLocaleString()}</td>
                    </tr>
                    {campaign.scheduled_date && (
                      <tr>
                        <th>Scheduled For</th>
                        <td>{new Date(campaign.scheduled_date).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>Campaign Statistics</Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={6} className="mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary rounded-circle p-2 me-2 text-white">
                        <i className="bi bi-envelope"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Emails Sent</div>
                        <div className="fw-bold">{emailsSent}</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} className="mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-info rounded-circle p-2 me-2 text-white">
                        <i className="bi bi-eye"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Emails Opened</div>
                        <div className="fw-bold">{emailsOpened}</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center">
                      <div className="bg-warning rounded-circle p-2 me-2 text-white">
                        <i className="bi bi-cursor"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Links Clicked</div>
                        <div className="fw-bold">{linksClicked}</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center">
                      <div className="bg-danger rounded-circle p-2 me-2 text-white">
                        <i className="bi bi-file-earmark-text"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Credentials Submitted</div>
                        <div className="fw-bold">{credentialsSubmitted}</div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mb-4">
          <Card.Header>Email Template</Card.Header>
          <Card.Body>
            <div className="email-template-preview border p-3">
              {campaign.template ? (
                <div dangerouslySetInnerHTML={{ __html: campaign.template }} />
              ) : (
                <p className="text-muted">No template content available</p>
              )}
            </div>
          </Card.Body>
        </Card>

        {results && results.length > 0 && (
          <Card>
            <Card.Header>Target Results</Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Target Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Email Sent</th>
                      <th>Opened</th>
                      <th>Clicked</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(result => (
                      <tr key={result.id}>
                        <td>{result.target?.name || 'Unknown'}</td>
                        <td>{result.target?.email || 'Unknown'}</td>
                        <td>{result.target?.department || 'Unknown'}</td>
                        <td className="text-center">
                          {result.email_sent ? 
                            <i className="bi bi-check-circle-fill text-success"></i> : 
                            <i className="bi bi-x-circle text-danger"></i>}
                        </td>
                        <td className="text-center">
                          {result.email_opened ? 
                            <i className="bi bi-check-circle-fill text-success"></i> : 
                            <i className="bi bi-x-circle text-danger"></i>}
                        </td>
                        <td className="text-center">
                          {result.link_clicked ? 
                            <i className="bi bi-check-circle-fill text-success"></i> : 
                            <i className="bi bi-x-circle text-danger"></i>}
                        </td>
                        <td className="text-center">
                          {result.credentials_submitted ? 
                            <i className="bi bi-check-circle-fill text-success"></i> : 
                            <i className="bi bi-x-circle text-danger"></i>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default CampaignDetail;