import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css';

const Home = ({ user }) => {
  return (
    <div>
      <Navbar activePage="home" />
      
      <div className="container mt-4">
        <header className="text-center mb-5">
          <h1>Welcome to the Phishing Simulator & Educator</h1>
          <p className="lead">Learn about phishing, test your skills, and protect yourself online.</p>
          {user && <p className="welcome-message">Hello, {user.username}!</p>}
        </header>

        <section className="info-section mb-5" id="education">
          <h2>What is Phishing?</h2>
          <p>
            Phishing is a type of cyber attack where attackers attempt to trick users into
            providing sensitive information by pretending to be trustworthy sources.
          </p>
        </section>

        <section className="phishing-methods mb-5">
          <h2>Types of Phishing Attacks</h2>
          <div className="row mt-4">
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Email Phishing</h3>
                  <p className="card-text">Fraudulent emails pretending to be from trusted sources, often tricking users into revealing sensitive information.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Website Spoofing</h3>
                  <p className="card-text">Fake websites designed to look like legitimate ones, aiming to steal login credentials or financial information.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Smishing</h3>
                  <p className="card-text">Phishing attacks carried out via SMS messages, tricking users into clicking malicious links or providing personal data.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title">Vishing</h3>
                  <p className="card-text">Voice phishing, where attackers impersonate trusted sources over the phone to steal sensitive information.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="video-section mb-5">
          <h2>Learn More About Phishing</h2>
          <div className="row mt-4">
            <div className="col-md-6 mb-4">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/gWGhUdHItto"
                  frameBorder="0"
                  allowFullScreen
                  title="What is Phishing?"
                ></iframe>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/Yz0PnAkeRiI"
                  frameBorder="0"
                  allowFullScreen
                  title="How to Identify Phishing Attempts"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <section className="quizzes-section mb-5" id="quizzes">
          <div className="card">
            <div className="card-body text-center">
              <h2 className="card-title">Phishing Training Quizzes</h2>
              <p className="card-text">Test your phishing knowledge by taking one of our interactive quizzes!</p>
              <Link to="/quizzes" className="btn btn-primary">Take a Quiz</Link>
            </div>
          </div>
        </section>
        
        {/* Security Best Practices Section */}
        <section className="best-practices mb-5">
          <h2>Security Best Practices</h2>
          <div className="row mt-4">
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title h5">Check Email Sender</h3>
                  <p className="card-text">Always verify the email address of the sender, not just the display name.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title h5">Inspect Links</h3>
                  <p className="card-text">Hover over links to see their true destination before clicking.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title h5">Be Wary of Urgency</h3>
                  <p className="card-text">Phishing attacks often create a false sense of urgency to make you act quickly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;