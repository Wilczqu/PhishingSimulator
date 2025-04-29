const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import the models from the index file
const db = require('./models');
const { User, Target, Campaign, CampaignResult } = db;

// Import routes
const phishingRoutes = require('./routes/phishing');
const templatesRoutes = require('./routes/templates');
const campaignsRoutes = require('./routes/campaigns');
const targetsRoutes = require('./routes/targets');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');

const app = express();
const saltRounds = 10;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

// Set up API Routes
app.use('/api/phishing', phishingRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/targets', targetsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/templates', templatesRoutes);

// Basic authentication endpoints with secure password handling
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
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
      return res.status(400).json({ 
        success: false, 
        error: 'Username already exists' 
      });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error during registration' 
    });
  }
});

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

    return res.json({ 
      success: true, 
      message: 'Login successful',
      userId: user.id,
      role: user.role || 'user'  // Return role for frontend authorization
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// Database and server initialization
async function waitForDatabase(retries = 10, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await db.sequelize.authenticate();
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
    
    // Sync models with the database
    await db.sequelize.sync({ alter: true }); // Use alter:true instead of force:false for safer migrations
    console.log('Database & tables created/updated!');
    
    // Create default admin user if it doesn't exist
    let adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      // Create admin with hashed password
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      adminUser = await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user created');
    }
    
    // Start the server after successful DB connection
    const PORT = process.env.PORT || 5050;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
})();