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
    }
  });
  
  return Target;
};