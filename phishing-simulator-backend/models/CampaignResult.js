'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CampaignResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CampaignResult.belongsTo(models.Campaign, {
        foreignKey: 'campaign_id',
        as: 'campaign'
      });
      CampaignResult.belongsTo(models.Target, {
        foreignKey: 'target_id',
        as: 'target'
      });
    }
  }
  CampaignResult.init({
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
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true  // Change to true if this field should be optional
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
    sequelize,
    modelName: 'CampaignResult',
    underscored: true,
    tableName: 'campaign_results'
  });
  return CampaignResult;
};