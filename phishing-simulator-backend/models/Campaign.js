const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Campaign = sequelize.define('Campaign', {
    name: DataTypes.STRING,
    subject: DataTypes.STRING,
    template: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed'),
      defaultValue: 'draft'
    },
    sender_name: DataTypes.STRING,
    sender_email: DataTypes.STRING,
    scheduled_date: DataTypes.DATE
  }, {
    // Add underscored option to use snake_case
    underscored: true,
    tableName: 'campaigns'
  });

  Campaign.associate = function(models) {
    Campaign.hasMany(models.CampaignResult, {
      foreignKey: 'campaign_id', // Change to snake_case
      as: 'results' // This alias must be used in all queries
    });
  };

  return Campaign;
};