import React from 'react';
import  { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

const ClickTrackerPopup = ({ show, onHide, user }) => {
  const handleTrackClick = async () => {
    try {
      await axios.post('/api/track-click', { userId: user.id });
      alert('Click tracked successfully!');
      onHide();
    } catch (error) {
      console.error('Error tracking click:', error);
      alert('Failed to track click');
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Welcome!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Click the button below to continue.</p>
        <Button variant="primary" onClick={handleTrackClick}>
          Continue
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default ClickTrackerPopup;