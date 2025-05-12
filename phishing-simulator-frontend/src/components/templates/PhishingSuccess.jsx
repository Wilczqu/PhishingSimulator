import React from 'react';
import  { Container, Card, Alert, Table, Button}   from 'react-bootstrap';
import  { Link, useLocation }  from 'react-router-dom';

const PhishingSuccess = () => {
  const location = useLocation();
  const capturedData = location.state || {}; // Get data passed via navigate state
  
  console.log("PhishingSuccess component rendering with data:", capturedData);

  return (
    <Container className="mt-5">
      <Card>
        <Card.Header className="bg-danger text-white">
          <h3>Phishing Demonstration Results</h3>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning">
            <h4>SIMULATION COMPLETE</h4>
            <p>This was a simulated phishing test. In a real attack, your credentials would now be in the hands of an attacker.</p>
          </Alert>
          
          <h5>Captured Information:</h5>
          <Table bordered>
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Timestamp</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{capturedData.capturedUsername || "Not captured"}</td>
                <td>{capturedData.capturedPassword || "Not captured"}</td>
                <td>{capturedData.capturedTimestamp ? new Date(capturedData.capturedTimestamp).toLocaleString() : "Not captured"}</td>
                <td>{capturedData.capturedIp || "127.0.0.1"}</td>
              </tr>
            </tbody>
          </Table>
          
          <div className="mt-4 text-center">
            <Link to="/home">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PhishingSuccess;