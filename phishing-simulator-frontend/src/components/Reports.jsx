import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import 'chart.js/auto';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap'; // ADDED: Table import

const Reports = ({ user }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [campaignStatus, setCampaignStatus] = useState('all');

  useEffect(() => {
    if (user && user.id) {
      fetchData();
    }
  }, [user, startDate, endDate, campaignStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const campaignsData = await fetchCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      let endpoint = user.role === 'admin' ? '/api/campaigns' : `/api/campaigns/user/${user.id}`;
      const params = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      if (campaignStatus !== 'all') params.status = campaignStatus;

      const response = await axios.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleExportCSV = () => {
    // Implement CSV export logic here
    console.log('Exporting to CSV...');
  };

  const handleExportPDF = () => {
    // Implement PDF export logic here
    console.log('Exporting to PDF...');
  };

  return (
    <div>
      <Navbar activePage="reports" user={user} />

      <Container className="mt-4">
        <Row>
          <Col md={12}>
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">Report Filters</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group controlId="startDate">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate ? startDate.toISOString().split('T')[0] : ''}
                        onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="endDate">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate ? endDate.toISOString().split('T')[0] : ''}
                        onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="campaignStatus">
                      <Form.Label>Campaign Status</Form.Label>
                      <Form.Control
                        as="select"
                        value={campaignStatus}
                        onChange={e => setCampaignStatus(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="draft">Draft</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12} className="text-end">
                    <Button variant="outline-secondary" onClick={fetchData}>
                      Apply Filters
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <Row>
                  <Col>
                    <h5 className="mb-0">Campaign Reports</h5>
                  </Col>
                  <Col className="text-end">
                    <Button variant="outline-success" size="sm" onClick={handleExportCSV}>
                      Export to CSV
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={handleExportPDF}>
                      Export to PDF
                    </Button>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : campaigns.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Campaign Name</th>
                          <th>Status</th>
                          <th>Start Date</th>
                          <th>Open Rate</th>
                          <th>Click Rate</th>
                          <th>Submission Rate</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(campaign => (
                          <tr key={campaign.id}>
                            <td>{campaign.name}</td>
                            <td>
                              <span className={`badge ${campaign.status === 'completed' ?
                                'bg-secondary' : 'bg-success'}`}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </span>
                            </td>
                            <td>{formatDate(campaign.createdAt)}</td>
                            <td>{campaign.open_rate || 0}%</td>
                            <td>{campaign.click_rate || 0}%</td>
                            <td>{campaign.submission_rate || 0}%</td>
                            <td>
                              <Link
                                to={`/report/${campaign.id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted">No active or completed campaigns to report on.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Reports;