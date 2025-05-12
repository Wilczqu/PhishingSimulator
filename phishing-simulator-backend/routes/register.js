const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

// POST /api/register
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create a new user record with hashed password
    const newUser = await User.create({ 
      username, 
      password: hashedPassword,
      role: 'user' // Default role
    });
    
    return res.status(201).json({ 
      success: true,
      message: 'Registration successful' 
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      // Username already taken
      return res.status(400).json({ 
        success: false,
        error: 'This username is already taken' 
      });
    }
    console.error(err);
    return res.status(500).json({ 
      success: false,
      error: 'An error occurred during registration' 
    });
  }
});

module.exports = router;