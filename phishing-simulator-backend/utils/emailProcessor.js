const fs = require('fs');
const path = require('path');

/**
 * Process an email template by replacing placeholders with actual data
 * @param {string} templateId - The template identifier ('office365' or 'paypal')
 * @param {Object} data - Object containing replacement values (user_name, phishing_url)
 * @returns {string} - The processed HTML email content
 */
function processTemplate(templateId, data = {}) {
  // Map the templateId to the actual filename for sending
  const sendingFileMapping = {
    'office365': 'sendingoffice365.html',
    'paypal': 'sendingpaypal.html'
  };

  const filename = sendingFileMapping[templateId];
  if (!filename) {
    throw new Error(`Unknown template ID: ${templateId}`);
  }

  const templatePath = path.join(__dirname, '../public/templates', filename);
  
  try {
    // Read the template file
    let html = fs.readFileSync(templatePath, 'utf8');
    
    // Replace all placeholders
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, data[key]);
    });
    
    return html;
  } catch (error) {
    console.error(`Error processing template ${templateId}:`, error);
    throw error;
  }
}

module.exports = { processTemplate };