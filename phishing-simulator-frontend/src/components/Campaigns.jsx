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
      setErrorMessage('Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCampaign({ name: '', template: '', subject: '', sender_name: '', sender_email: '' }); // Reset form
    setErrorMessage(''); // Clear any error messages
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
    setErrorMessage(''); // Clear any previous error messages
    
    try {
      const response = await axios.post('/api/campaigns', newCampaign);
      if (response.status === 201) {
        setSuccessMessage('Campaign created successfully!');
        fetchCampaigns(); // Refresh campaigns list
        handleCloseModal(); // Close the modal
      } else {
        setErrorMessage('Failed to create campaign.');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setErrorMessage('Failed to create campaign. Please check the form and try again.');
    }
  };

  const handleLaunchCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to launch this campaign? This will send phishing emails to all assigned targets.')) {
      try {
        const response = await axios.post(`/api/campaigns/${campaignId}/launch`);
        setSuccessMessage('Campaign launched successfully!');
        fetchCampaigns(); // Refresh the list
      } catch (error) {
        console.error('Error launching campaign:', error);
        setErrorMessage(`Failed to launch campaign: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await axios.delete(`/api/campaigns/${campaignId}`);
        setSuccessMessage('Campaign deleted successfully!');
        fetchCampaigns(); // Refresh the list
      } catch (error) {
        console.error('Error deleting campaign:', error);
        setErrorMessage(`Failed to delete campaign: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <div>
      <Navbar activePage="campaigns" user={user} />
      
      <div className="container mt-4">
        <h2>Campaigns</h2>
        
        {successMessage && (
          <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Campaign List</h3>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus"></i> Create Campaign
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(campaign => (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{campaign.subject}</td>
                    <td>{campaign.status}</td>
                    <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/campaign/${campaign.id}`} className="btn btn-sm btn-outline-info me-1">
                        <i className="bi bi-eye"></i> Details
                      </Link>
                      
                      {campaign.status === 'draft' && (
                        <Button 
                          variant="outline-success"
                          size="sm"
                          className="me-1" 
                          onClick={() => handleLaunchCampaign(campaign.id)}
                        >
                          <i className="bi bi-rocket"></i> Launch
                        </Button>
                      )}
                      
                      {campaign.status === 'active' || campaign.status === 'completed' ? (
                        <Link to={`/campaign/${campaign.id}`} className="btn btn-sm btn-outline-primary me-1">
                          <i className="bi bi-bar-chart"></i> Report
                        </Link>
                      ) : null}
                      
                      <Button 
                        variant="outline-danger"
                        size="sm" 
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <i className="bi bi-trash"></i> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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