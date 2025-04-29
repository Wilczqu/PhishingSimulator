const express = require('express');
const router = express.Router();
const { CampaignResult, Campaign, Target } = require('../models');
const { Op } = require('sequelize');

// Track email opens via tracking pixel
router.get('/track/:token', async (req, res) => {
  try {
    const result = await CampaignResult.findOne({ 
      where: { unique_token: req.params.token }
    });
    
    if (result) {
      if (!result.email_opened) {
        await result.update({ 
          email_opened: true,
          opened_at: new Date()
        });
      }
    }
    
    // Return a 1x1 transparent tracking pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
    
  } catch (error) {
    console.error('Error tracking email open:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track link clicks and redirect to phishing page
router.get('/click/:token', async (req, res) => {
  try {
    const result = await CampaignResult.findOne({
      where: { unique_token: req.params.token },
      include: [
        { model: Campaign, as: 'campaign' }
      ]
    });
    
    if (!result) {
      return res.status(404).send('Not found');
    }
    
    // Update result if link hasn't been clicked yet
    if (!result.link_clicked) {
      await result.update({
        link_clicked: true,
        clicked_at: new Date(),
        user_agent: req.headers['user-agent'],
        ip_address: req.ip
      });
    }
    
    // Redirect to the appropriate phishing page based on template
    const template = result.campaign.template;
    res.redirect(`/phish/${template}/${result.unique_token}`);
    
  } catch (error) {
    console.error('Error tracking link click:', error);
    res.status(500).send('Server error');
  }
});

// Handle credential submission from phishing pages
router.post('/submit/:token', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await CampaignResult.findOne({ 
      where: { unique_token: req.params.token }
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Invalid token' });
    }
    
    await result.update({
      credentials_submitted: true,
      submitted_at: new Date(),
      captured_username: username,
      captured_password: password
    });
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error recording credential submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all results for a specific campaign
router.get('/campaign/:campaignId/results', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const results = await CampaignResult.findAll({
      where: { campaign_id: campaignId },
      include: [
        { model: Target, as: 'target', attributes: ['id', 'name', 'email', 'department'] }
      ],
      order: [['id', 'ASC']]
    });
    
    res.json(results);
    
  } catch (error) {
    console.error('Error fetching campaign results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve phishing landing page
router.get('/:template/:token', async (req, res) => {
  try {
    const { template, token } = req.params;
    
    // Validate token
    const result = await CampaignResult.findOne({ 
      where: { unique_token: token }
    });
    
    if (!result) {
      return res.status(404).send('Page not found');
    }
    
    // Render appropriate template based on the campaign template type
    res.render(`phishing/${template}`, { token });
    
  } catch (error) {
    console.error('Error serving phishing page:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;