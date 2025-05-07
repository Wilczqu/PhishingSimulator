const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CampaignResult = sequelize.define('CampaignResult', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    unique_token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_opened: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    link_clicked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    credentials_submitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    clicked_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    captured_username: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    captured_password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    // Use snake_case for column names to match original schema
    underscored: true,
    tableName: 'campaign_results'
  });

  // Define associations in the model
  CampaignResult.associate = (models) => {
    CampaignResult.belongsTo(models.Campaign, {
      foreignKey: 'campaign_id',
      as: 'campaign'
    });
    
    CampaignResult.belongsTo(models.Target, {
      foreignKey: 'target_id',
      as: 'target'
    });
    
    CampaignResult.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return CampaignResult;
};