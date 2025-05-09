const express = require('express');
const router = express.Router();
const db = require('../models');
const bcryptjs = require('bcryptjs');

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Use bcryptjs.compare here
    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    return res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  
  try {
    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Use bcryptjs.compare here
    const passwordMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'username', 'role', 'lastLogin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change user role (admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent changing admintud role
    if (user.username === 'admintud') {
      return res.status(403).json({ message: 'Cannot change role for this user' });
    }
    
    await user.update({ role });
    res.json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin dashboard data endpoint
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users count
    const userCount = await db.User.count();
    
    // Get campaigns statistics
    const campaignCount = await db.Campaign.count();
    const activeCampaigns = await db.Campaign.count({
      where: { status: 'active' }
    });
    const completedCampaigns = await db.Campaign.count({
      where: { status: 'completed' }
    });

    // Get targets statistics
    const targetCount = await db.Target.count();
    
    // Get email statistics
    const emailsSent = await db.CampaignResult.count({
      where: { email_sent: true }
    });
    const emailsOpened = await db.CampaignResult.count({
      where: { email_opened: true }
    });
    const linksClicked = await db.CampaignResult.count({
      where: { link_clicked: true }
    });
    const credentialsSubmitted = await db.CampaignResult.count({
      where: { credentials_submitted: true }
    });
    
    // Get quiz statistics - check for both QuizResult and QuizResults model names
    let quizCount = 0;
    let quizAttempts = 0;
    let quizPassed = 0;
    
    if (db.Quiz) {
      quizCount = await db.Quiz.count();
    }
    
    // Handle potential model name differences
    const QuizResultModel = db.QuizResult || db.QuizResults;
    if (QuizResultModel) {
      quizAttempts = await QuizResultModel.count();
      quizPassed = await QuizResultModel.count({
        where: { passed: true }
      });
    }
    
    // Recent activities
    const recentResults = await db.CampaignResult.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.Campaign, attributes: ['name'] },
        { model: db.Target, attributes: ['name', 'email'] }
      ]
    });

    res.json({
      users: {
        total: userCount
      },
      campaigns: {
        total: campaignCount,
        active: activeCampaigns,
        completed: completedCampaigns
      },
      targets: {
        total: targetCount
      },
      emails: {
        sent: emailsSent,
        opened: emailsOpened,
        clicked: linksClicked,
        submitted: credentialsSubmitted
      },
      quizzes: {
        total: quizCount,
        attempts: quizAttempts,
        passed: quizPassed,
        passRate: quizAttempts > 0 ? (quizPassed / quizAttempts * 100).toFixed(2) : 0
      },
      recentActivity: recentResults.map(result => ({
        id: result.id,
        campaign: result.Campaign ? result.Campaign.name : 'Unknown Campaign',
        target: result.Target ? result.Target.name : 'Unknown User',
        email: result.Target ? result.Target.email : '',
        action: result.link_clicked ? 'Clicked Link' : result.email_opened ? 'Opened Email' : 'Email Sent',
        timestamp: result.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;