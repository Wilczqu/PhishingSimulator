import React from 'react';
import  { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import '../App.css';

const Home = ({ user }) => {
  // Check if user has admin role
  const isAdmin = user && user.role === 'admin';

  return (
    <div>
      <Navbar activePage="home" user={user} />

      <Container className="mt-4">
        <header className="text-center mb-5">
          <h1>Welcome to the Phishing Simulator & Educator</h1>
          <p className="lead">Learn about phishing, test your skills, and protect yourself online.</p>
          {user && <p className="welcome-message">Hello, {user.username}!</p>}
        </header>

        {/* Phishing Demo Preview - Moved to replace the educational content */}
        <Card className="my-4 border-danger">
          <Card.Body className="text-center py-4">
            <div className="text-danger mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
              </svg>
            </div>
            <h3 className="mb-3">Phishing Demo Preview</h3>
            <p className="mb-4">See a complete demonstration of how a phishing email appears to targets and how user data is captured</p>
            
            <Link to="/phishing-demo"> {/* Changed from "/phish/demo" to "/phishing-demo" */}
              <Button variant="outline-danger" className="px-4">
                Launch Demo Preview
              </Button>
            </Link>
          </Card.Body>
        </Card>

        <section className="phishing-methods mb-5">
          <h2>Types of Phishing Attacks</h2>
          <Row className="mt-4">
            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Email Phishing</Card.Title>
                  <Card.Text>Fraudulent emails pretending to be from trusted sources, often tricking users into revealing sensitive information.</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Website Spoofing</Card.Title>
                  <Card.Text>Fake websites designed to look like legitimate ones, aiming to steal login credentials or financial information.</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Smishing</Card.Title>
                  <Card.Text>Phishing attacks carried out via SMS messages, tricking users into clicking malicious links or providing personal data.</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Vishing</Card.Title>
                  <Card.Text>Voice phishing, where attackers impersonate trusted sources over the phone to steal sensitive information.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="video-section mb-5">
          <h2>Learn More About Phishing</h2>
          <Row className="mt-4">
            <Col md={6} className="mb-4">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/gWGhUdHItto"
                  frameBorder="0"
                  allowFullScreen
                  title="What is Phishing?"
                ></iframe>
              </div>
            </Col>
            <Col md={6} className="mb-4">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/Yz0PnAkeRiI"
                  frameBorder="0"
                  allowFullScreen
                  title="How to Identify Phishing Attempts"
                ></iframe>
              </div>
            </Col>
          </Row>
        </section>

        <section className="quizzes-section mb-5" id="quizzes">
          <Card>
            <Card.Body className="text-center">
              <Card.Title>Phishing Training Quizzes</Card.Title>
              <Card.Text>Test your phishing knowledge by taking one of our interactive quizzes!</Card.Text>
              <Link to="/quizzes" className="btn btn-primary">Take a Quiz</Link>
            </Card.Body>
          </Card>
        </section>

        {/* Admin dashboard link - only visible to admin users */}
        {isAdmin && (
          <section className="admin-section mb-5">
            <Card bg="light">
              <Card.Body>
                <Card.Title>Administration</Card.Title>
                <Card.Text>Access administration tools and reports.</Card.Text>
                <Row className="d-flex gap-2">
                  <Col><Link to="/admin" className="btn btn-primary">Admin Dashboard</Link></Col>
                  <Col><Link to="/campaigns" className="btn btn-outline-primary">Manage Campaigns</Link></Col>
                  <Col><Link to="/targets" className="btn btn-outline-primary">Manage Targets</Link></Col>
                  <Col><Link to="/reports" className="btn btn-outline-primary">View Reports</Link></Col>
                </Row>
              </Card.Body>
            </Card>
          </section>
        )}

        <section className="best-practices mb-5">
          <h2>Security Best Practices</h2>
          <Row className="mt-4">
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="h5">Check Email Sender</Card.Title>
                  <Card.Text>Always verify the email address of the sender, not just the display name.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="h5">Inspect Links</Card.Title>
                  <Card.Text>Hover over links to see their true destination before clicking.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="h5">Be Wary of Urgency</Card.Title>
                  <Card.Text>Phishing attacks often create a false sense of urgency to make you act quickly.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>
      </Container>
    </div>
  );
};

export default Home;