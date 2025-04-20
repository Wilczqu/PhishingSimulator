// models/User.js
const { Sequelize, DataTypes } = require('sequelize');

// Create a new Sequelize instance. Adjust to your DB config.
const sequelize = new Sequelize('phishingdb', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
});

// Define the User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Export both the model and the sequelize instance
module.exports = { User, sequelize };
