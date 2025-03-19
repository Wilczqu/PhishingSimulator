// server.js
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Configure CORS to only allow POST from http://localhost:3000
app.use(
  '/api',
  cors({
    origin: 'http://localhost:3000',
    methods: ['POST'],
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
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await User.create({ username, password });
    return res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      // Username is already taken
      return res.status(400).json({ error: 'This username is already taken' });
    }
    console.error(err);
    return res
      .status(500)
      .json({ error: 'An error occurred during registration' });
  }
});

// ----------------------------------------------
// 2) Login Endpoint
// ----------------------------------------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // 1) Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'USER_NOT_FOUND' });
    }

    // 2) Compare passwords (plain text in this demo)
    if (user.password !== password) {
      return res.status(400).json({ error: 'INCORRECT_PASSWORD' });
    }

    // 3) If match, send success
    return res.json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ----------------------------------------------
// 3) Start the Server
// ----------------------------------------------
const PORT = 5000; // or any port you prefer
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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

(async () => {
  try {
    await waitForDatabase();
    // Sync models after the DB is confirmed ready
    await sequelize.sync();
    console.log('Database & tables created!');
    
    // Start the server after successful DB connection
    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
})();
