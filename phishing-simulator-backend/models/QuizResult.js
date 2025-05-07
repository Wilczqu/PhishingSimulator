'use strict';

module.exports = (sequelize, DataTypes) => {
  const QuizResult = sequelize.define('QuizResult', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
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
  });
  
  QuizResult.associate = (models) => {
    // QuizResult belongs to a User
    QuizResult.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    // QuizResult belongs to a Quiz
    QuizResult.belongsTo(models.Quiz, {
      foreignKey: 'quizId',
      as: 'quiz'
    });
  };
  
  return QuizResult;
};