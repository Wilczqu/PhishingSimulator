'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CampaignResults', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Campaigns',
          key: 'id'
        }
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Targets',
          key: 'id'
        }
      },
      user_id: { // ADDED: user_id field
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      email_sent: {
        type: Sequelize.BOOLEAN
      },
      email_opened: {
        type: Sequelize.BOOLEAN
      },
      link_clicked: {
        type: Sequelize.BOOLEAN
      },
      credentials_submitted: {
        type: Sequelize.BOOLEAN
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CampaignResults');
  }
};