import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

const PhishingPopup = ({ show, onHide, campaign, user }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/api/phishing/submit', {
        token: campaign.unique_token,
        username: credentials.username,
        password: credentials.password,
      });
      alert('Credentials submitted successfully!');
      onHide();
    } catch (error) {
      console.error('Error submitting credentials:', error);
      alert('Failed to submit credentials');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Phishing Simulation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {campaign && campaign.template ? (
          <div dangerouslySetInnerHTML={{ __html: campaign.template }} />
        ) : (
          <p>No template available.</p>
        )}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Enter username"
              value={credentials.username}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              value={credentials.password}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PhishingPopup;