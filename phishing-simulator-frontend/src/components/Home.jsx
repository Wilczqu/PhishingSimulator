// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><a href="/quizzes">Quizzes</a></li>
          <li><a href="/education">Education</a></li>
          <li><a href="/gallery">Gallery</a></li>
          <li><Link to="/admin">Admin</Link></li> {/* Added Admin Dashboard link */}
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>

      <div className="container">
        <header>
          <h1>Welcome to the Phishing Simulator & Educator</h1>
          <p>Learn about phishing, test your skills, and protect yourself online.</p>
        </header>

        <section className="info-section" id="education">
          <h2>What is Phishing?</h2>
          <p>
            Phishing is a type of cyber attack where attackers attempt to trick users into
            providing sensitive information by pretending to be trustworthy sources.
          </p>
        </section>

        <section className="phishing-methods">
          <h2>Types of Phishing Attacks</h2>
          <div className="cards-container">
            <div className="card float-left">
              <h3>Email Phishing</h3>
              <p>Fraudulent emails pretending to be from trusted sources, often tricking users into revealing sensitive information.</p>
            </div>

            <div className="card float-right offset">
              <h3>Website Spoofing</h3>
              <p>Fake websites designed to look like legitimate ones, aiming to steal login credentials or financial information.</p>
            </div>

            <div className="card float-left">
              <h3>Smishing</h3>
              <p>Phishing attacks carried out via SMS messages, tricking users into clicking malicious links or providing personal data.</p>
            </div>

            <div className="card float-right offset">
              <h3>Vishing</h3>
              <p>Voice phishing, where attackers impersonate trusted sources over the phone to steal sensitive information.</p>
            </div>
          </div>
        </section>

        <section className="video-section">
          <h2>Learn More About Phishing</h2>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/gWGhUdHItto"
            frameBorder="0"
            allowFullScreen
            title="Video 1"
          ></iframe>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/Yz0PnAkeRiI"
            frameBorder="0"
            allowFullScreen
            title="Video 2"
          ></iframe>
        </section>

        <section className="info-section" id="quizzes">
          <h2>Phishing Training Quizzes</h2>
          <p>Test your phishing knowledge by taking one of our interactive quizzes!</p>
          <Link to="/quizzes" className="quiz-btn">Go to Quizzes</Link>
        </section>
      </div>
    </div>
  );
};

export default Home;
