const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Campaign = sequelize.define('Campaign', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    template: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sender_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sender_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'active', 'completed'),
      defaultValue: 'draft',
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  });
  
  return Campaign;
};