const express = require('express');
const router = express.Router();
const { Campaign, Target, CampaignResult, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get dashboard overview stats
router.get('/overview', async (req, res) => {
  try {
    const [targetCount, campaignCount, sentCount, openedCount, clickedCount, submittedCount] = await Promise.all([
      Target.count(),
      Campaign.count(),
      CampaignResult.count({ where: { email_sent: true } }),
      CampaignResult.count({ where: { email_opened: true } }),
      CampaignResult.count({ where: { link_clicked: true } }),
      CampaignResult.count({ where: { credentials_submitted: true } })
    ]);
    
    res.json({
      totalTargets: targetCount,
      totalCampaigns: campaignCount,
      emailsSent: sentCount,
      emailsOpened: openedCount,
      linksClicked: clickedCount,
      credentialsSubmitted: submittedCount
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get overall stats for reports
router.get('/overall', async (req, res) => {
  try {
    // Get department-wise stats
    const departmentStats = await Target.findAll({
      attributes: [
        'department',
        [sequelize.fn('COUNT', sequelize.col('Target.id')), 'total'],
        [sequelize.literal(`SUM(CASE WHEN "CampaignResults"."credentials_submitted" = true THEN 1 ELSE 0 END)`), 'submitted']
      ],
      include: [{
        model: CampaignResult,
        attributes: [],
        required: false,
        where: {
          email_sent: true
        }
      }],
      group: ['department'],
      raw: true
    });
    
    // Get overall stats
    const [targetCount, sentCount, openedCount, clickedCount, submittedCount] = await Promise.all([
      Target.count(),
      CampaignResult.count({ where: { email_sent: true } }),
      CampaignResult.count({ where: { email_opened: true } }),
      CampaignResult.count({ where: { link_clicked: true } }),
      CampaignResult.count({ where: { credentials_submitted: true } })
    ]);
    
    res.json({
      totalTargets: targetCount,
      emailsSent: sentCount,
      emailsOpened: openedCount,
      linksClicked: clickedCount,
      credentialsSubmitted: submittedCount,
      departmentStats
    });
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats for a specific campaign
router.get('/campaign/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    // Get campaign details
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Get campaign stats
    const [resultCount, sentCount, openedCount, clickedCount, submittedCount] = await Promise.all([
      CampaignResult.count({ where: { campaign_id: campaignId } }),
      CampaignResult.count({ where: { campaign_id: campaignId, email_sent: true } }),
      CampaignResult.count({ where: { campaign_id: campaignId, email_opened: true } }),
      CampaignResult.count({ where: { campaign_id: campaignId, link_clicked: true } }),
      CampaignResult.count({ where: { campaign_id: campaignId, credentials_submitted: true } })
    ]);
    
    res.json({
      campaign: campaign.name,
      targetCount: resultCount,
      emailsSent: sentCount,
      emailsOpened: openedCount,
      linksClicked: clickedCount,
      credentialsSubmitted: submittedCount,
      openRate: sentCount > 0 ? (openedCount / sentCount * 100).toFixed(1) : 0,
      clickRate: openedCount > 0 ? (clickedCount / openedCount * 100).toFixed(1) : 0,
      submissionRate: clickedCount > 0 ? (submittedCount / clickedCount * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;