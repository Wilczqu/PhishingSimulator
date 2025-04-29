'use strict';

module.exports = (sequelize, DataTypes) => {
  const QuizResult = sequelize.define('QuizResult', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true
  });

  QuizResult.associate = (models) => {
    // QuizResult belongs to a User
    QuizResult.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return QuizResult;
};