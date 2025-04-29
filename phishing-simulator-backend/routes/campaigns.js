const express = require('express');
const router = express.Router();
const { Campaign, Target, CampaignResult } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { processTemplate } = require('../utils/emailProcessor');

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent campaigns (for dashboard)
router.get('/recent', async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching recent campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific campaign
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [
        {
          model: CampaignResult,
          as: 'results',
          include: [
            {
              model: Target,
              as: 'target',
              attributes: ['id', 'name', 'email', 'department']
            }
          ]
        }
      ]
    });
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const { name, template, subject, sender_name, sender_email, targets } = req.body;
    
    // Create campaign
    const campaign = await Campaign.create({
      name,
      template,
      subject,
      sender_name,
      sender_email,
      status: 'draft'
    });
    
    // If targets are provided, create campaign results
    if (targets && targets.length > 0) {
      const results = [];
      
      for (const targetId of targets) {
        results.push({
          campaign_id: campaign.id,
          target_id: targetId,
          unique_token: crypto.randomBytes(32).toString('hex'),
          email_sent: false,
          email_opened: false,
          link_clicked: false,
          credentials_submitted: false
        });
      }
      
      if (results.length > 0) {
        await CampaignResult.bulkCreate(results);
      }
    }
    
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a campaign
router.put('/:id', async (req, res) => {
  try {
    const { name, template, subject, sender_name, sender_email, status } = req.body;
    
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Update campaign
    await campaign.update({
      name: name || campaign.name,
      template: template || campaign.template,
      subject: subject || campaign.subject,
      sender_name: sender_name || campaign.sender_name,
      sender_email: sender_email || campaign.sender_email,
      status: status || campaign.status
    });
    
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Delete associated campaign results
    await CampaignResult.destroy({
      where: { campaign_id: campaign.id }
    });
    
    // Delete campaign
    await campaign.destroy();
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add targets to a campaign
router.post('/:id/targets', async (req, res) => {
  try {
    const { targetIds } = req.body;
    const campaignId = req.params.id;
    
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Create campaign results for new targets
    const results = [];
    
    for (const targetId of targetIds) {
      // Check if target already exists in campaign
      const existingResult = await CampaignResult.findOne({
        where: {
          campaign_id: campaignId,
          target_id: targetId
        }
      });
      
      if (!existingResult) {
        results.push({
          campaign_id: campaignId,
          target_id: targetId,
          unique_token: crypto.randomBytes(32).toString('hex'),
          email_sent: false,
          email_opened: false,
          link_clicked: false,
          credentials_submitted: false
        });
      }
    }
    
    if (results.length > 0) {
      await CampaignResult.bulkCreate(results);
    }
    
    res.status(201).json({ message: 'Targets added to campaign' });
  } catch (error) {
    console.error('Error adding targets to campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW ENDPOINT: Send a campaign
router.post('/:id/send', async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    // Get the campaign details
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Get all campaign results that haven't been sent yet
    const campaignResults = await CampaignResult.findAll({
      where: { 
        campaign_id: campaignId,
        email_sent: false
      },
      include: [
        {
          model: Target,
          as: 'target',
          attributes: ['id', 'name', 'email', 'department']
        }
      ]
    });
    
    if (campaignResults.length === 0) {
      return res.status(400).json({ error: 'No unsent targets found for this campaign' });
    }
    
    // Process emails using template
    const processedEmails = [];
    
    for (const result of campaignResults) {
      try {
        const target = result.target;
        
        // Generate phishing URL with tracking token
        const phishingUrl = `${process.env.BASE_URL || 'http://localhost:8050'}/api/phishing/track/${result.unique_token}`;
        
        // Process template
        const emailHtml = processTemplate(campaign.template, {
          user_name: target.name,
          phishing_url: phishingUrl
        });
        
        // In a real application, you would send the email here
        // For demonstration, we'll just mark it as sent
        
        processedEmails.push({
          to: target.email,
          from: `"${campaign.sender_name}" <${campaign.sender_email}>`,
          subject: campaign.subject,
          html: emailHtml
        });
        
        // Mark as sent in the database
        await result.update({ email_sent: true });
      } catch (err) {
        console.error(`Error processing email for target ${result.target_id}:`, err);
        // Continue with other targets even if one fails
      }
    }
    
    // Update campaign status to active
    await campaign.update({ status: 'active' });
    
    res.json({ 
      success: true, 
      message: `Campaign sent to ${processedEmails.length} recipients`,
      emails_sent: processedEmails.length,
      total_targets: campaignResults.length
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW ENDPOINT: Get campaign statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const stats = await CampaignResult.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal('email_sent::int')), 'sent'],
        [sequelize.fn('SUM', sequelize.literal('email_opened::int')), 'opened'],
        [sequelize.fn('SUM', sequelize.literal('link_clicked::int')), 'clicked'],
        [sequelize.fn('SUM', sequelize.literal('credentials_submitted::int')), 'submitted']
      ],
      where: { campaign_id: campaignId }
    });
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching campaign statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;