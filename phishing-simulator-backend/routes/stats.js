const express = require('express');
const router = express.Router();
const { Campaign, CampaignResult, Quiz, QuizResult, Target } = require('../models');
const { Op } = require('sequelize');

// Get dashboard overview stats
router.get('/overview', async (req, res) => {
  try {
    const [targetCount, campaignCount, sentCount, openedCount, clickedCount, submittedCount, quizCount, quizAttempts, quizPassed] = await Promise.all([
      Target.count(),
      Campaign.count(),
      CampaignResult.count({ where: { email_sent: true } }),
      CampaignResult.count({ where: { email_opened: true } }),
      CampaignResult.count({ where: { link_clicked: true } }),
      CampaignResult.count({ where: { credentials_submitted: true } }),
      Quiz.count(),
      QuizResult.count(),
      QuizResult.count({ where: { passed: true } })
    ]);
    
    res.json({
      totalTargets: targetCount,
      totalCampaigns: campaignCount,
      emailsSent: sentCount,
      emailsOpened: openedCount,
      linksClicked: clickedCount,
      credentialsSubmitted: submittedCount,
      // Add quiz statistics to actually use QuizResult
      totalQuizzes: quizCount,
      quizAttempts: quizAttempts,
      quizzesPassed: quizPassed,
      passRate: quizAttempts > 0 ? (quizPassed / quizAttempts * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get overall stats for all campaigns - simplified to avoid association errors
router.get('/overall', async (req, res) => {
  try {
    // Use simpler queries to avoid association issues
    const campaignCount = await Campaign.count();
    const targetCount = await CampaignResult.count({ 
      distinct: true,
      col: 'target_id'
    });
    
    const sentCount = await CampaignResult.count({ 
      where: { email_sent: true } 
    });
    
    const openedCount = await CampaignResult.count({ 
      where: { email_opened: true } 
    });
    
    const clickedCount = await CampaignResult.count({ 
      where: { link_clicked: true } 
    });
    
    const submittedCount = await CampaignResult.count({ 
      where: { credentials_submitted: true } 
    });

    // Add quiz statistics to use QuizResult
    const quizAttempts = await QuizResult.count();
    const quizPassed = await QuizResult.count({ where: { passed: true } });
    
    res.json({
      campaigns: campaignCount,
      totalTargets: targetCount,
      emailsSent: sentCount,
      emailsOpened: openedCount,
      linksClicked: clickedCount,
      credentialsSubmitted: submittedCount,
      // Quiz stats
      quizAttempts: quizAttempts,
      quizzesPassed: quizPassed,
      passRate: quizAttempts > 0 ? (quizPassed / quizAttempts * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    // Return zeros instead of failing
    res.json({
      campaigns: 0,
      totalTargets: 0,
      emailsSent: 0,
      emailsOpened: 0,
      linksClicked: 0,
      credentialsSubmitted: 0,
      quizAttempts: 0,
      quizzesPassed: 0,
      passRate: 0
    });
  }
});

// Add a new route for quiz statistics
router.get('/quizzes', async (req, res) => {
  try {
    // Get all quizzes with their attempt counts
    const quizzes = await Quiz.findAll({
      attributes: ['id', 'title', 'active']
    });
    
    // Get stats for each quiz
    const quizStats = await Promise.all(quizzes.map(async (quiz) => {
      const attempts = await QuizResult.count({ where: { quizId: quiz.id } });
      const passed = await QuizResult.count({ where: { quizId: quiz.id, passed: true } });
      
      return {
        id: quiz.id,
        title: quiz.title,
        active: quiz.active,
        attempts: attempts,
        passed: passed,
        passRate: attempts > 0 ? (passed / attempts * 100).toFixed(1) : 0
      };
    }));
    
    res.json(quizStats);
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
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

// Get stats for a specific user
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Simplified query to avoid association issues
    const userCampaigns = await Campaign.findAll({
      attributes: ['id'],
      where: { userId: userId }
    });
    
    const campaignIds = userCampaigns.map(c => c.id);
    
    // If user has no campaigns, return zeros
    if (campaignIds.length === 0) {
      return res.json({
        totalTargets: 0,
        emailsSent: 0,
        emailsOpened: 0,
        linksClicked: 0,
        credentialsSubmitted: 0
      });
    }
    
    // Use COUNT queries instead of complex joins
    const targetCount = await CampaignResult.count({
      distinct: true,
      col: 'target_id',
      where: { campaign_id: { [Op.in]: campaignIds } }
    });
    
    const sentCount = await CampaignResult.count({ 
      where: { 
        campaign_id: { [Op.in]: campaignIds },
        email_sent: true 
      } 
    });
    
    const openedCount = await CampaignResult.count({ 
      where: { 
        campaign_id: { [Op.in]: campaignIds },
        email_opened: true 
      } 
    });
    
    const clickedCount = await CampaignResult.count({ 
      where: { 
        campaign_id: { [Op.in]: campaignIds },
        link_clicked: true 
      } 
    });
    
    const submittedCount = await CampaignResult.count({ 
      where: { 
        campaign_id: { [Op.in]: campaignIds },
        credentials_submitted: true 
      } 
    });
    
    res.json({
      totalTargets: targetCount,
      emailsSent: sentCount,
      emailsOpened: openedCount,
      linksClicked: clickedCount,
      credentialsSubmitted: submittedCount
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.json({
      totalTargets: 0,
      emailsSent: 0,
      emailsOpened: 0,
      linksClicked: 0,
      credentialsSubmitted: 0
    });
  }
});

module.exports = router;