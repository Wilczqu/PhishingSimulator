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
// Add this with your other require statements
const quizzesRoutes = require('./routes/quizzes');

const app = express();
const saltRounds = 10;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure CORS
// Add Docker service names to allowed origins
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://frontend', 'http://backend:5050'],
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
// Add this with your other app.use statements
app.use('/api/quizzes', quizzesRoutes);

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
      user: {
        id: user.id,
        username: user.username,
        role: user.role || 'user',
        // Include any other needed user fields, but NOT the password
      }
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
    // Add this after creating the admin user in your initialization function
    // Create default quiz if it doesn't exist
    let emailQuiz = await db.Quiz.findOne({ where: { title: 'Email Quiz' } });
    if (!emailQuiz) {
      emailQuiz = await db.Quiz.create({
        title: 'Email Quiz',
        description: 'Test your knowledge of phishing emails and messages',
        questions: [
          [
            "Phishing: Dear Customer, your account has been compromised. Please follow this link ACCOUNT RESET(badlink.com). Failure to comply will result in the account being permanently disabled.",
            ['True', 'False'],
            'True',
            "This email uses generic language, urgency, and a suspicious link to pressure the recipient. It's a phishing attempt.",
            "Email Phishing"
          ],
          [
            "Normal: Hi, here is the invoice you requested. If you need anything else let me know.",
            ['True', 'False'],
            'False',
            "This email appears legitimate as it is conversational and doesn't ask for sensitive information or use pressuring language.",
            "Email Phishing"
          ],
          // Add all the other questions from your provided data
          [
            "Phishing: Hi, how's it going? It was a good meeting we had last month, here's the document that you asked for last week document1(badlink.com). Let me know if there is anything we need to change.",
            ['True', 'False'],
            'True',
            "This email uses familiarity and a fabricated relationship to appear credible. The link provided is malicious.",
            "Spear-Phishing"
          ],
          [
            "Normal: Hi, here are the slides from our meeting yesterday evening slides.ppt(sharepoint.com). Let me know if there's anything else you need.",
            ['True', 'False'],
            'False',
            "This email seems legitimate as it references a recent meeting and uses a trusted file-sharing platform.",
            "Spear-Phishing"
          ],
          [
            "Phishing: Your package is stuck in customs and is pending payment. If you do not pay within 24 hours, the package will be returned to the sender. Click here to make the payment of 27.83 euro AnPostPayCustom.com.",
            ['True', 'False'],
            'True',
            "This SMS uses urgency and a suspicious link to lure the recipient into making a fraudulent payment.",
            "Smishing"
          ],
          [
            "Normal: Hi, This is a reminder of your dental appointment at Lucan Dental on April 17th at 10:00am. This is a no-reply message.",
            ['True', 'False'],
            'False',
            "This message appears legitimate as it references a valid appointment and contains no suspicious links or requests for information.",
            "Smishing"
          ],
          [
            "Phishing: This is a voicemail from AIB for the Republic of Ireland. There is an issue with your account which needs to be corrected urgently as fraudulent activity is being detected. Return the call to this number immediately or else your account will be suspended and reported to the authorities.",
            ['True', 'False'],
            'True',
            "This voicemail uses urgency and fear to coerce the recipient into contacting a fraudulent number.",
            "Vishing"
          ],
          [
            "Normal: Hi, This is AIB Lucan. Can you please give us a call on our customer service number which is available online or call into our branch please to clarify a transaction.",
            ['True', 'False'],
            'False',
            "This voicemail appears legitimate as it provides standard instructions and asks the recipient to use official contact methods.",
            "Vishing"
          ],
          [
            "Phishing: You receive an email from your supervisor - 'Please review attached document. I am busy now so don't contact me. Here is the link Doc1(badlink.com).'",
            ['True', 'False'],
            'True',
            "This email mimics a legitimate message but uses an altered link to deceive the recipient.",
            "Clone Phishing"
          ],
          [
            "Normal: Hi team, please review the slide deck before tomorrow's meeting and contact me if any information is required.",
            ['True', 'False'],
            'False',
            "This email appears legitimate as it provides clear instructions without any suspicious links or pressure.",
            "Clone Phishing"
          ],
          [
            "Phishing: You receive an email from the CEO - 'Hi, I have an urgent task for you which is highly confidential. The ECB is fining us 10,000 euro due to passing deadlines on our reporting. Transfer the funds to the following IBAN IE24AIBK2783778273. Do not reply to this email when complete.'",
            ['True', 'False'],
            'True',
            "This email uses urgency and impersonation to trick the recipient into transferring funds to a fraudulent account.",
            "Business Email Compromise (BEC)"
          ],
          [
            "Normal: You receive an email from the finance department - 'Hi, your payslip has been now uploaded to your HR system where it is now visible. Payments will be processed to your account on Friday. If you have any questions feel free to contact a member of the Finance team or HR.'",
            ['True', 'False'],
            'False',
            "This email appears legitimate as it provides standard instructions without urgency or requests for sensitive actions.",
            "Business Email Compromise (BEC)"
          ]
        ],
        active: true
      });
      console.log('Default Email Quiz created');
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