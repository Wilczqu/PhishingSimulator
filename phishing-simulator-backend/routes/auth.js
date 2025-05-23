const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const saltRounds = 10;

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid username or password' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, error: 'Invalid username or password' });
    }

    // Update last login time
    await user.update({ lastLogin: new Date() });

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// Register route with improved username validation
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters and password at least 6 characters'
      });
    }

    // Check if username already exists with a clear message
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'This username is already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Create new user - always as regular user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: 'user', // Force role to be 'user'
      active: true
    });

    // Remove password from response
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again later.'
    });
  }
});

// Make sure this route exists in your auth.js file
router.post('/logout', (req, res) => {
  // If using sessions
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      return res.json({ message: 'Logged out successfully' });
    });
  } else {
    // If not using sessions or already logged out
    res.json({ message: 'Already logged out' });
  }
});
module.exports = router;