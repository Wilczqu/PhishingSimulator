// filepath: c:\PhishingSimulator\PhishingSimulator\phishing-simulator-backend\migrations\20250509113000-add-last-login-and-role-to-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'lastLogin', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'user'),
      defaultValue: 'user',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'lastLogin');
    await queryInterface.removeColumn('Users', 'role');
  }
};