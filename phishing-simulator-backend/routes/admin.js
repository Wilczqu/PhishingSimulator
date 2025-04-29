const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    return res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.password !== currentPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;