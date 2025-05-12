import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Card } from 'react-bootstrap';
import Navbar from './Navbar';

const PhishingDemo = ({ user }) => {
  return (
    <div>
      <Navbar activePage="demo" user={user} />
      
      <Container className="mt-4">
        <Card className="mb-4">
          <Card.Body>
            <h2>Phishing Simulation Demo</h2>
            <p>This demo will show you how a phishing email looks and what happens when you interact with it.</p>
            
            <Link to="/demo/preview-email">
              <Button variant="primary">Continue to Preview Email</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PhishingDemo;