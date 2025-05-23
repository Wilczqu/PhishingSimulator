const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Target = sequelize.define('Target', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: { // Add this
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    underscored: true,
    tableName: 'targets'
  });

  Target.associate = (models) => {
    Target.hasMany(models.CampaignResult, {
      foreignKey: 'target_id',
      as: 'results'
    });
    Target.belongsTo(models.User, { // Add this
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Target;
};