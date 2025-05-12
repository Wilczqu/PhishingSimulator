// filepath: c:\endyearproject\PhishingSimulator\phishing-simulator-backend\migrations\20250319151257-create-user.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeConstraint('Targets', 'targets_user_id_fkey', { // Drop foreign key constraint from Targets table
        ifExists: true
      });
    } catch (error) {
      console.log('Targets table does not exist, skipping removeConstraint');
    }
    try {
      await queryInterface.removeConstraint('CampaignResults', 'campaign_results_user_id_fkey', { // Drop foreign key constraint from CampaignResults table
        ifExists: true
      });
    } catch (error) {
      console.log('CampaignResults table does not exist, skipping removeConstraint');
    }
    try {
      await queryInterface.removeConstraint('QuizResults', 'QuizResults_userId_fkey', { // Drop foreign key constraint from QuizResults table
        ifExists: true
      });
    } catch (error) {
      console.log('QuizResults table does not exist, skipping removeConstraint');
    }
    await queryInterface.dropTable('Users');
  }
};