// In a seeder file like ...backend/seeders/xxxx-demo-campaign.js
// ...
await queryInterface.bulkInsert('campaigns', [{
  id: 999, // Use a specific ID or let it auto-increment
  name: 'Phishing Demo Campaign',
  subject: 'Demo Subject',
  template: 'office365', // Matches the template name used in the demo
  status: 'active',
  sender_name: 'Demo Sender',
  sender_email: 'demo@example.com',
  created_at: new Date(),
  updated_at: new Date()
}], {});

const demoCampaign = await db.Campaign.findOne({ where: { name: 'Phishing Demo Campaign' } }); // Or use the ID

if (demoCampaign) {
  await queryInterface.bulkInsert('campaign_results', [{
    campaign_id: demoCampaign.id,
    target_id: 1, // Assuming a generic target ID 1 exists or create a demo target
    user_id: 1,   // Assuming a generic user ID 1 exists (e.g., admin)
    unique_token: 'demo_phish_token', // Critical for the demo flow
    email_sent: true, // Assume email was "sent" for the demo
    email_opened: false,
    link_clicked: false,
    credentials_submitted: false,
    created_at: new Date(),
    updated_at: new Date()
  }], {});
}
// ...