const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/templates
router.get('/', (req, res) => {
  const templatesDir = path.join(__dirname, '../public/templates');
  
  try {
    // Map your existing templates
    const templates = [
      {
        id: 'office365',
        name: 'Office 365 Password Reset',
        previewFile: 'previewoffice365.html',
        sendingFile: 'sendingoffice365.html'
      },
      {
        id: 'paypal',
        name: 'PayPal Security Alert',
        previewFile: 'Paypalsecalertpreview.html',
        sendingFile: 'sendingpaypal.html'
      }
    ];
    
    res.json(templates);
  } catch (err) {
    console.error('Error processing templates:', err);
    res.status(500).json({ error: 'Failed to retrieve templates' });
  }
});

// GET /api/templates/:id
router.get('/:id', (req, res) => {
  const templateId = req.params.id;
  
  // Define file mapping based on template ID
  const fileMapping = {
    'office365': 'previewoffice365.html',
    'paypal': 'Paypalsecalertpreview.html'
  };
  
  if (!fileMapping[templateId]) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  const templatePath = path.join(__dirname, '../public/templates', fileMapping[templateId]);
  
  try {
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf8');
      res.json({ id: templateId, content });
    } else {
      res.status(404).json({ error: 'Template file not found' });
    }
  } catch (err) {
    console.error(`Error reading template ${templateId}:`, err);
    res.status(500).json({ error: 'Failed to retrieve template' });
  }
});

module.exports = router;