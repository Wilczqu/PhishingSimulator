const express = require('express');
const router = express.Router();
const { Campaign, Target, CampaignResult, sequelize } = require('../models'); // Ensure sequelize is imported
const crypto = require('crypto'); // For unique_token
const fs = require('fs'); // For reading template files
const path = require('path'); // For constructing file paths

// GET recent campaigns
router.get('/recent', async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: CampaignResult,
        as: 'results',
      }]
    });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching recent campaigns:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// GET all campaigns (Modified to include aggregated stats)
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      order: [['createdAt', 'DESC']],
      // Removed include for results here to calculate stats separately for performance
    });

    const campaignsWithStats = await Promise.all(campaigns.map(async (campaign) => {
      const results = await CampaignResult.findAll({ where: { campaign_id: campaign.id } });
      const totalTargetsInCampaign = new Set(results.map(r => r.target_id)).size; // Count unique targets involved
      const emailsSent = results.filter(r => r.email_sent).length;
      const emailsOpened = results.filter(r => r.email_opened).length;
      const linksClicked = results.filter(r => r.link_clicked).length;
      const credentialsSubmitted = results.filter(r => r.credentials_submitted).length;

      return {
        ...campaign.toJSON(), // Get plain object
        total_targets_in_campaign: totalTargetsInCampaign,
        emails_sent_count: emailsSent,
        emails_opened_count: emailsOpened,
        links_clicked_count: linksClicked,
        credentials_submitted_count: credentialsSubmitted,
        open_rate: emailsSent > 0 ? ((emailsOpened / emailsSent) * 100).toFixed(1) : 0,
        click_rate: emailsOpened > 0 ? ((linksClicked / emailsOpened) * 100).toFixed(1) : 0, // Or base on emailsSent
        submission_rate: linksClicked > 0 ? ((credentialsSubmitted / linksClicked) * 100).toFixed(1) : 0,
      };
    }));

    res.json(campaignsWithStats);
  } catch (error) {
    console.error('Error fetching campaigns with stats:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// GET a specific campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure id is a number to prevent errors
    const campaignId = parseInt(id);
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }
    
    const campaign = await Campaign.findByPk(campaignId, {
      include: [{
        model: CampaignResult,
        as: 'results',
        include: [{
          model: Target,
          as: 'target',
          attributes: ['name', 'email', 'department']
        }]
      }]
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// NEW ENDPOINT: Send a campaign
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetId, userId } = req.body; // ADDED: userId

    if (!targetId) {
      return res.status(400).json({ message: 'Target ID is required' });
    }

    if (!userId) { // ADDED: userId validation
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the campaign
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Find the target
    const target = await Target.findByPk(targetId);
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }

    // Create campaign result
    const campaignResult = await CampaignResult.create({
      campaign_id: id,
      target_id: targetId,
      user_id: userId, // ADDED: userId
      unique_token: crypto.randomBytes(32).toString('hex'),
      email_sent: true,
      email_opened: false,
      link_clicked: false,
      credentials_submitted: false
    });

    // Update campaign status
    await campaign.update({ status: 'active' });

    // Fetch updated campaign with results
    const updatedCampaign = await Campaign.findByPk(id, {
      include: [{
        model: CampaignResult,
        as: 'results', // Add this alias
        include: [{
          model: Target,
          as: 'target', // Add this alias too
          attributes: ['name', 'email', 'department']
        }]
      }]
    });

    res.json({
      message: 'Campaign sent successfully',
      campaign: updatedCampaign
    });

  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// NEW ENDPOINT: Preview a campaign
router.get('/:campaignId/preview/:targetId', async (req, res) => {
  try {
    const { campaignId, targetId } = req.params;

    // Find the campaign
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Find the target
    const target = await Target.findByPk(targetId);
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }

    // Generate a sample phishing URL
    const sampleToken = crypto.randomBytes(32).toString('hex');
    const phishingUrl = `/phish/${campaign.template}/${sampleToken}`; // Use campaign.template

    // Render the email template (replace with your actual template rendering logic)
    const emailTemplate = `
      <html>
      <body>
        <p>Dear ${target.name},</p>
        <p>Click this link to update your password: <a href="${phishingUrl}">${phishingUrl}</a></p>
      </body>
      </html>
    `;

    res.json({
      message: 'Campaign preview generated successfully',
      emailTemplate: emailTemplate
    });

  } catch (error) {
    console.error('Error generating campaign preview:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Fix the email preview endpoint

// Preview email for a specific target in a campaign
// This route is called by the EmailPreview.jsx component
router.get('/:campaignId/preview/:targetId', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    const targetId = parseInt(req.params.targetId, 10);

    if (isNaN(campaignId) || isNaN(targetId)) {
      return res.status(400).send('Invalid campaign or target ID.');
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).send('Campaign not found.');
    }

    const target = await Target.findByPk(targetId);
    if (!target) {
      return res.status(404).send('Target not found.');
    }

    // Find or create a CampaignResult for this preview
    let result = await CampaignResult.findOne({
      where: { campaign_id: campaignId, target_id: targetId }
    });

    let uniqueToken;

    if (!result) {
      uniqueToken = crypto.randomBytes(16).toString('hex');
      result = await CampaignResult.create({
        campaign_id: campaignId,
        target_id: targetId,
        user_id: campaign.userId || null, // Ensure campaign model has userId or handle default
        unique_token: uniqueToken,
        email_sent: true,
        sent_at: new Date(),
        // other fields (email_opened, link_clicked, etc.) remain false/null
      });
    } else {
      uniqueToken = result.unique_token || crypto.randomBytes(16).toString('hex'); // Ensure token exists
      result.unique_token = uniqueToken; // Update if it was missing
      if (!result.email_sent) { // Mark as sent if not already for this preview context
        result.email_sent = true;
        result.sent_at = new Date();
      }
      await result.save();
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; // Adjust to your React dev port if different
    const phishingTemplateType = campaign.template || 'office365'; // Default or from campaign
    const phishingLink = `${FRONTEND_URL}/#/phish/${phishingTemplateType}/${uniqueToken}`;
    
    // --- Email HTML Generation ---
    // This part needs to be robust. You should fetch the actual template HTML.
    // Assuming your templates are in `phishing-simulator-backend/public/templates/sending<TemplateName>.html`
    // And your `templates.js` defines `sendingFile` for each template.
    
    // Find the sendingFile for the campaign's template
    // This logic might be better centralized if you have a template service/helper
    let templateFileName;
    if (campaign.template === 'office365') {
        templateFileName = 'sendingoffice365.html';
    } else if (campaign.template === 'paypal') {
        templateFileName = 'sendingpaypal.html';
    } else {
        // Fallback or error if template is unknown
        console.warn(`Unknown campaign template: ${campaign.template}. Using a default placeholder.`);
        templateFileName = 'default_sending_template.html'; // Create a placeholder if needed
    }

    const templateFilePath = path.join(__dirname, '..', 'public', 'templates', templateFileName);
    let emailHtml = `<html><body>Error: Email template '${templateFileName}' not found or could not be processed.</body></html>`; // Default error HTML

    if (fs.existsSync(templateFilePath)) {
        emailHtml = fs.readFileSync(templateFilePath, 'utf8');
        // Replace placeholders
        emailHtml = emailHtml.replace(/{{target_name}}/g, target.name || 'User');
        emailHtml = emailHtml.replace(/{{target_email}}/g, target.email || '');
        emailHtml = emailHtml.replace(/{{phishing_link}}/g, phishingLink);
        emailHtml = emailHtml.replace(/{{campaign_subject}}/g, campaign.subject || 'Important Update');
        emailHtml = emailHtml.replace(/{{sender_name}}/g, campaign.sender_name || 'Support Team');
        emailHtml = emailHtml.replace(/{{sender_email}}/g, campaign.sender_email || 'noreply@example.com');
        // Add tracking pixel for 'open' - ensure your /api/phishing/track-open is a GET endpoint or adjust
        // const TRACKING_SERVER_URL = process.env.BACKEND_URL || 'http://localhost:5000'; // Your backend URL
        // emailHtml = emailHtml.replace('</body>', `<img src="${TRACKING_SERVER_URL}/api/phishing/track-open?token=${uniqueToken}" width="1" height="1" alt="" /></body>`);

    } else {
        console.error(`Email template file not found: ${templateFilePath}`);
    }
    // --- End Email HTML Generation ---

    res.setHeader('Content-Type', 'text/html');
    return res.send(emailHtml);

  } catch (error) {
    console.error('Error generating email preview:', error);
    res.status(500).send('Failed to generate email preview. Check server logs.');
  }
});

// Preview email for a specific target in a campaign
router.get('/:campaignId/preview/:targetId', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    const targetId = parseInt(req.params.targetId, 10);

    if (isNaN(campaignId) || isNaN(targetId)) {
      return res.status(400).send('Invalid campaign or target ID.');
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).send('Campaign not found.');
    }

    const target = await Target.findByPk(targetId);
    if (!target) {
      return res.status(404).send('Target not found.');
    }

    let result = await CampaignResult.findOne({
      where: { campaign_id: campaignId, target_id: targetId }
    });

    let uniqueToken;

    if (!result) {
      uniqueToken = crypto.randomBytes(16).toString('hex');
      result = await CampaignResult.create({
        campaign_id: campaignId,
        target_id: targetId,
        user_id: campaign.userId || null,
        unique_token: uniqueToken,
        email_sent: true,
        sent_at: new Date(),
      });
    } else {
      uniqueToken = result.unique_token || crypto.randomBytes(16).toString('hex');
      result.unique_token = uniqueToken;
      if (!result.email_sent) {
        result.email_sent = true;
        result.sent_at = new Date();
      }
      await result.save();
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const phishingTemplateType = campaign.template || 'office365';
    // Ensure the link starts with /# for hash router compatibility
    const phishingLink = `${FRONTEND_URL}/#/phish/${phishingTemplateType}/${uniqueToken}`;
    
    let templateFileName;
    // Simplified template selection - ensure these files exist in public/templates/
    if (campaign.template === 'office365') {
        templateFileName = 'sendingoffice365.html';
    } else if (campaign.template === 'paypal') {
        templateFileName = 'sendingpaypal.html';
    } else if (campaign.template === 'custom' && campaign.custom_template_name) {
        // Example for a custom template stored by name
        templateFileName = `${campaign.custom_template_name}.html`;
    } else {
        console.warn(`Unknown or default campaign template: ${campaign.template}. Using default_sending_template.html.`);
        templateFileName = 'default_sending_template.html'; // A fallback template
    }

    const templateFilePath = path.join(__dirname, '..', 'public', 'templates', templateFileName);
    let emailHtml = `<html><body><p>Error: Email template '${templateFileName}' not found or could not be processed.</p><p>Debug Info: Campaign Template: ${campaign.template}, Target Name: ${target.name}</p></body></html>`;

    if (fs.existsSync(templateFilePath)) {
        emailHtml = fs.readFileSync(templateFilePath, 'utf8');
        emailHtml = emailHtml.replace(/{{target_name}}/g, target.name || 'User');
        emailHtml = emailHtml.replace(/{{target_email}}/g, target.email || '');
        emailHtml = emailHtml.replace(/{{phishing_link}}/g, phishingLink);
        emailHtml = emailHtml.replace(/{{campaign_subject}}/g, campaign.subject || 'Important Update');
        emailHtml = emailHtml.replace(/{{sender_name}}/g, campaign.sender_name || 'Support Team');
        emailHtml = emailHtml.replace(/{{sender_email}}/g, campaign.sender_email || 'noreply@example.com');
        
        // Optional: Add tracking pixel for 'open'
        // const TRACKING_SERVER_URL = process.env.BACKEND_URL || 'http://localhost:5000';
        // const trackingPixelHtml = `<img src="${TRACKING_SERVER_URL}/api/phishing/track-open?token=${uniqueToken}" width="1" height="1" alt="" style="display:none;" />`;
        // if (emailHtml.includes('</body>')) {
        //   emailHtml = emailHtml.replace('</body>', `${trackingPixelHtml}</body>`);
        // } else {
        //   emailHtml += trackingPixelHtml;
        // }
    } else {
        console.error(`Email template file not found: ${templateFilePath}`);
    }

    // CRITICAL CHANGE: Send raw HTML with correct content type
    res.setHeader('Content-Type', 'text/html');
    return res.send(emailHtml);

  } catch (error) {
    console.error('Error generating email preview:', error);
    // Send a plain text error or simple HTML error page for the iframe
    res.status(500).setHeader('Content-Type', 'text/html');
    res.send('<html><body><h1>Error 500</h1><p>Failed to generate email preview. Please check server logs.</p></body></html>');
  }
});

// POST a new campaign
router.post('/', async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// PUT (update) an existing campaign
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Campaign.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedCampaign = await Campaign.findByPk(id);
      return res.json({ message: 'Campaign updated successfully', campaign: updatedCampaign });
    }
    return res.status(404).json({ message: 'Campaign not found' });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// DELETE a campaign
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Campaign.destroy({
      where: { id: id }
    });
    if (deleted) {
      return res.json({ message: 'Campaign deleted successfully' });
    }
    return res.status(404).json({ message: 'Campaign not found' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Associate/Update targets for a specific campaign
router.put('/:campaignId/targets', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    const { targetIds } = req.body; // Expect an array of target IDs

    if (!Array.isArray(targetIds)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'targetIds must be an array.' });
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    // 1. Find existing CampaignResult entries for this campaign
    const existingResults = await CampaignResult.findAll({
      where: { campaign_id: campaignId },
      attributes: ['target_id'],
      transaction
    });
    const existingTargetIds = new Set(existingResults.map(r => r.target_id));

    // 2. Determine new targets to add (those in targetIds but not in existingTargetIds)
    const newTargetIdsToAdd = targetIds.filter(id => !existingTargetIds.has(id));

    // To fully sync (add and remove), you'd:
    const currentTargetIdsInRequest = new Set(targetIds.map(id => parseInt(id, 10))); // Ensure IDs are numbers
    const targetIdsToRemove = Array.from(existingTargetIds).filter(id => !currentTargetIdsInRequest.has(id));

    if (targetIdsToRemove.length > 0) {
      await CampaignResult.destroy({ 
        where: { 
          campaign_id: campaignId, 
          target_id: targetIdsToRemove // target_id should be 'target_id' not 'id'
        }, 
        transaction 
      });
    }

    if (newTargetIdsToAdd.length > 0) {
      const targetsToAdd = await Target.findAll({
        where: { id: newTargetIdsToAdd },
        transaction
      });

      if (targetsToAdd.length !== newTargetIdsToAdd.length) {
        await transaction.rollback();
        return res.status(400).json({ message: 'One or more specified targets to add do not exist.' });
      }

      const campaignResultObjects = targetsToAdd.map(target => ({
        campaign_id: campaignId,
        target_id: target.id,
        user_id: target.userId || 1, // Assuming a default or that target has userId. Adjust as needed.
        unique_token: crypto.randomBytes(16).toString('hex'), // Generate a unique token
        email_sent: false, // Default status
        // ... other default fields for CampaignResult
      }));

      await CampaignResult.bulkCreate(campaignResultObjects, { transaction });
    }

    await transaction.commit();
    res.json({ message: 'Campaign targets updated successfully.' });

  } catch (error) {
    await transaction.rollback();
    console.error('Error updating campaign targets:', error);
    res.status(500).json({ message: 'Failed to update campaign targets.', error: error.message });
  }
});

// Update the launch campaign endpoint

// Launch campaign
router.post('/:id/launch', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find campaign
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Check if campaign is already launched
    if (campaign.status !== 'draft') {
      return res.status(400).json({ message: 'Campaign is already launched' });
    }
    
    // Find all results for this campaign
    const results = await CampaignResult.findAll({
      where: { campaign_id: id }
    });
    
    if (results.length === 0) {
      return res.status(400).json({ message: 'Campaign has no targets assigned' });
    }
    
    // Update campaign status
    campaign.status = 'active';
    campaign.launched_at = sequelize.fn('NOW');
    await campaign.save();
    
    // Mark all emails as sent
    for (const result of results) {
      result.email_sent = true;
      result.sent_at = sequelize.fn('NOW');
      await result.save();
    }
    
    res.json({ 
      message: 'Campaign launched successfully', 
      campaign, 
      targetsCount: results.length 
    });
    
  } catch (error) {
    console.error('Error launching campaign:', error);
    res.status(500).json({ message: 'Failed to launch campaign' });
  }
});

// Add these routes to support target assignment and email preview

// Get targets assigned to a campaign
router.get('/:id/targets', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get all campaign results with target information
    const results = await CampaignResult.findAll({
      where: { campaign_id: id },
      include: [
        { model: Target, as: 'target' }
      ]
    });
    
    // Extract targets from results
    const targets = results.map(result => {
      return {
        id: result.target.id,
        name: result.target.name,
        email: result.target.email,
        department: result.target.department,
        email_sent: result.email_sent,
        email_opened: result.email_opened,
        link_clicked: result.link_clicked,
        credentials_submitted: result.credentials_submitted
      };
    });
    
    res.json(targets);
    
  } catch (error) {
    console.error('Error getting campaign targets:', error);
    res.status(500).json({ message: 'Failed to get campaign targets' });
  }
});

// Assign targets to a campaign
router.post('/:id/targets', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetIds } = req.body;
    
    // Verify campaign exists
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Check if campaign is in draft status
    if (campaign.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot add targets to an active or completed campaign' });
    }
    
    // Create campaign results for each target
    const results = [];
    for (const targetId of targetIds) {
      const target = await Target.findByPk(targetId);
      if (target) {
        // Check if this target is already assigned
        const existing = await CampaignResult.findOne({
          where: {
            campaign_id: id,
            target_id: targetId
          }
        });
        
        if (!existing) {
          // Here's the fix - use target.userId if available, otherwise use a default admin ID
          const userId = target.userId || req.user?.id || 1; // Default to admin user ID 1
          
          const result = await CampaignResult.create({
            campaign_id: id,
            target_id: targetId,
            user_id: userId, 
            unique_token: crypto.randomBytes(16).toString('hex')
          });
          results.push(result);
        }
      }
    }
    
    res.status(201).json({
      message: `${results.length} targets assigned to campaign`,
      results
    });
    
  } catch (error) {
    console.error('Error assigning targets to campaign:', error);
    res.status(500).json({ message: 'Failed to assign targets to campaign' });
  }
});

// Add this endpoint to get campaign results

// Get campaign results for reports
router.get('/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find campaign
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get results with target information
    const results = await CampaignResult.findAll({
      where: { campaign_id: id },
      include: [
        { 
          model: Target,
          as: 'target',
          attributes: ['id', 'name', 'email', 'department'] 
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error getting campaign results:', error);
    res.status(500).json({ message: 'Failed to get campaign results' });
  }
});

// POST to generate/retrieve a token for email preview
router.post('/:campaignId/preview-token/:targetId', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    const targetId = parseInt(req.params.targetId, 10);

    if (isNaN(campaignId) || isNaN(targetId)) {
      return res.status(400).json({ message: 'Invalid campaign or target ID.' });
    }

    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    // Note: We don't strictly need the target model for just the token,
    // but it's good practice if you were to use target details later.
    // const target = await Target.findByPk(targetId);
    // if (!target) {
    //   return res.status(404).json({ message: 'Target not found for preview token generation.' });
    // }

    let result = await CampaignResult.findOne({
      where: { campaign_id: campaignId, target_id: targetId }
    });

    let uniqueToken;

    if (!result) {
      uniqueToken = crypto.randomBytes(16).toString('hex');
      result = await CampaignResult.create({
        campaign_id: campaignId,
        target_id: targetId,
        user_id: campaign.userId || null, // Assuming campaign has userId
        unique_token: uniqueToken,
        email_sent: true, // Mark as sent for preview tracking
        sent_at: new Date(),
      });
    } else {
      uniqueToken = result.unique_token || crypto.randomBytes(16).toString('hex'); // Ensure token exists
      result.unique_token = uniqueToken;
      if (!result.email_sent) { // Mark as sent if not already for this preview context
        result.email_sent = true;
        result.sent_at = new Date();
      }
      await result.save();
    }

    res.json({
      unique_token: result.unique_token,
      template_name: campaign.template || 'office365', // Default to office365
      campaign_subject: campaign.subject,
      // You might want to send target_name if EmailPreview doesn't have it
      // target_name: target.name 
    });

  } catch (error) {
    console.error('Error generating preview token:', error);
    res.status(500).json({ message: 'Failed to generate preview token.' });
  }
});

module.exports = router;