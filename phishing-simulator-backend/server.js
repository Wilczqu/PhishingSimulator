// server.js
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

// Add health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

// Configure CORS to only allow POST from http://localhost:3000
app.use(
  '/api',
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST, // will resolve to "db" when using Docker
    dialect: 'postgres',
    port: 5432,
  }
);

// Define the User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Sync models with the database
sequelize
  .sync()
  .then(() => console.log('Database & tables created!'))
  .catch((err) => console.error('Error syncing database:', err));

// ----------------------------------------------
// 1) Registration Endpoint
// ----------------------------------------------
const bcrypt = require('bcrypt');
const saltRounds = 10;
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({ 
      username, 
      password: hashedPassword 
    });
    return res.status(201).json({ 
      success: true,
      message: 'Registration successful' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Username already exists' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      error: 'Server error during registration' 
    });
  }
});

// ----------------------------------------------
// 2) Login Endpoint
// ----------------------------------------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'USER_NOT_FOUND' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, error: 'INCORRECT_PASSWORD' });
    }

    return res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    // ... error handling
  }
});

// ----------------------------------------------
// 3) Start the Server
// ----------------------------------------------
// Remove the first server start block
// const PORT = 5432; // Remove this
// app.listen(PORT, () => { ... }); // Remove this

// Keep the database connection function
async function waitForDatabase(retries = 10, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      return;
    } catch (err) {
      console.log(`Database not ready, retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unable to connect to the database after multiple attempts.');
}

// Update the server initialization
(async () => {
  try {
    // Wait for database connection
    await waitForDatabase();
    
    // Sync models after the DB is confirmed ready
    await sequelize.sync();
    console.log('Database & tables created!');
    
    // Start the server after successful DB connection
    const PORT = process.env.PORT || 5050;  // Changed from 5432
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();