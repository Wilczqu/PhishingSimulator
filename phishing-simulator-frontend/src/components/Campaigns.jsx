import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import TemplateSelector from './TemplateSelector'; // Import the TemplateSelector component

const Campaigns = ({ user }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template: '',
    subject: '',
    sender_name: '',
    sender_email: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = (templateId) => {
    setNewCampaign(prev => ({ ...prev, template: templateId }));
  };

  const handleAddCampaign = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/campaigns', newCampaign);
      setNewCampaign({
        name: '',
        template: '',
        subject: '',
        sender_name: '',
        sender_email: '',
      });
      setShowModal(false);
      setSuccessMessage('Campaign created successfully!');
      fetchCampaigns();
      
      // Optional: Navigate to campaign detail page for target selection
      // const campaignId = response.data.id;
      // navigate(`/campaign/${campaignId}/targets`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to create campaign');
    }
  };

  return (
    <div>
      <Navbar activePage="campaigns" user={user} />
      
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Phishing Campaigns</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus"></i> New Campaign
          </Button>
        </div>
        
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
            {successMessage}
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
            {errorMessage}
          </Alert>
        )}
        
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Targets</th>
                  <th>Opens</th>
                  <th>Clicks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <Link to={`/campaign/${campaign.id}`}>
                          {campaign.name}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${
                          campaign.status === 'active' ? 'bg-success' : 
                          campaign.status === 'scheduled' ? 'bg-info' : 
                          campaign.status === 'completed' ? 'bg-secondary' : 'bg-warning'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                      <td>{campaign.targetCount || 0}</td>
                      <td>{campaign.openCount || 0}</td>
                      <td>{campaign.clickCount || 0}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link to={`/campaign/${campaign.id}`} className="btn btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link to={`/campaign/${campaign.id}/targets`} className="btn btn-outline-secondary">
                            <i className="bi bi-people"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No campaigns yet. Create your first campaign!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Create Campaign Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddCampaign}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Campaign Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={newCampaign.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* Replace simple dropdown with Template Selector */}
            <TemplateSelector 
              selectedTemplate={newCampaign.template}
              onSelectTemplate={handleTemplateSelect}
            />
            
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Email Subject</label>
              <input
                type="text"
                className="form-control"
                id="subject"
                name="subject"
                value={newCampaign.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="sender_name" className="form-label">Sender Name</label>
              <input
                type="text"
                className="form-control"
                id="sender_name"
                name="sender_name"
                value={newCampaign.sender_name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="sender_email" className="form-label">Sender Email</label>
              <input
                type="email"
                className="form-control"
                id="sender_email"
                name="sender_email"
                value={newCampaign.sender_email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="d-grid gap-2">
              <Button type="submit" variant="primary">
                Create Campaign
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Campaigns;