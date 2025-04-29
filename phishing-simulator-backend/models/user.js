'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 50], // Username must be between 3-50 characters
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100] // Hashed passwords will be longer, but this ensures minimum input length
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin']] // Only allow these roles
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Optional for now
      validate: {
        isEmail: true // Validates email format
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    // Additional model options
    timestamps: true, // Adds createdAt and updatedAt
    paranoid: true,   // Enables soft deletes (deletedAt)
    indexes: [
      {
        unique: true,
        fields: ['username']
      }
    ]
  });

  // Define associations with other models
  User.associate = (models) => {
    // A User can have many CampaignResults
    User.hasMany(models.CampaignResult, {
      foreignKey: 'userId',
      as: 'campaignResults'
    });
    
    // A User can have many QuizResults
    User.hasMany(models.QuizResult, {
      foreignKey: 'userId',
      as: 'quizResults'
    });
  };

  // Instance methods
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password; // Don't expose password hash
    return values;
  };

  // Class methods
  User.findByUsername = function(username) {
    return User.findOne({ where: { username } });
  };

  return User;
};