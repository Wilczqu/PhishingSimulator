// routes/register.js
const express = require('express');
const router = express.Router();
const { User } = require('../models/User'); // Import the User model

// POST /api/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Create a new user record
    const newUser = await User.create({ username, password });
    return res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      // Username already taken
      return res.status(400).json({ error: 'This username is already taken' });
    }
    console.error(err);
    return res.status(500).json({ error: 'An error occurred during registration' });
  }
});

module.exports = router;
