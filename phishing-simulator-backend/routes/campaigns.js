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
    // First try to get the campaign without associations
    const campaign = await Campaign.findByPk(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Now try to get the results separately
    try {
      const results = await CampaignResult.findAll({
        where: { campaign_id: req.params.id },
        include: [
          {
            model: Target,
            as: 'target',
            attributes: ['id', 'name', 'email', 'department']
          }
        ]
      });
      
      // Combine the data
      const campaignData = campaign.toJSON();
      campaignData.results = results;
      
      res.json(campaignData);
    } catch (resultError) {
      console.error('Error fetching campaign results:', resultError);
      // Return just the campaign without results
      res.json(campaign);
    }
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a campaign without associations (fallback for when eager loading fails)
router.get('/:id/basic', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching basic campaign:', error);
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
    const { id } = req.params;
    const { targetId } = req.body;

    if (!targetId) {
      return res.status(400).json({ message: 'Target ID is required' });
    }

    // Find the campaign
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Find the target
    const target = await Target.findByPk(targetId);
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }

    // Create campaign result
    const campaignResult = await CampaignResult.create({
      campaignId: id,
      targetId: targetId,
      email_sent: true,
      email_opened: false,
      link_clicked: false,
      credentials_submitted: false
    });

    // Update campaign status
    await campaign.update({ status: 'active' });

    // Fetch updated campaign with results
    const updatedCampaign = await Campaign.findByPk(id, {
      include: [{
        model: CampaignResult,
        include: [{
          model: Target,
          attributes: ['name', 'email', 'department']
        }]
      }]
    });

    res.json({
      message: 'Campaign sent successfully',
      campaign: updatedCampaign
    });

  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
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

// Get campaigns for specific user
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const campaigns = await Campaign.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW ENDPOINT: Get campaign for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the campaign result for the user
    const campaignResult = await CampaignResult.findOne({
      where: {
        target_id: userId,
        email_sent: true, // Only get campaigns that have been sent
        credentials_submitted: false // Only get campaigns that haven't been completed
      },
      include: [
        {
          model: Campaign,
          as: 'campaign',
          attributes: ['id', 'name', 'template', 'subject', 'sender_name', 'sender_email', 'status']
        }
      ]
    });

    if (campaignResult) {
      res.json(campaignResult.campaign);
    } else {
      res.status(404).json({ message: 'No active campaign found for this user' });
    }
  } catch (error) {
    console.error('Error getting campaign for user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/campaigns/:id/targets
router.put('/:id/targets', async (req, res) => {
  try {
    const { targetIds } = req.body;
    const campaignId = req.params.id;

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Delete existing campaign results
    await CampaignResult.destroy({
      where: { campaign_id: campaignId }
    });

    // Create campaign results for selected targets
    const results = [];
    for (const targetId of targetIds) {
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

    await CampaignResult.bulkCreate(results);

    res.json({ message: 'Campaign targets updated successfully' });
  } catch (error) {
    console.error('Error updating campaign targets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/campaigns/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const campaign = await Campaign.findOne({ where: { userId } }); // Fetch campaign for the user
    res.json(campaign);
  } catch (error) {
    console.error('Error getting campaign for user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;