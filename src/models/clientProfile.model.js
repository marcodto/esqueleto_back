const { Model } = require('sequelize');

module.exports = class ClientProfile extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        weight: DataTypes.FLOAT,
        height: DataTypes.FLOAT,
        goal: DataTypes.STRING,

        allergies: DataTypes.JSON,
        food_preferences: DataTypes.JSON,
      },
      {
        sequelize,
        tableName: 'client_profiles',
        modelName: 'ClientProfile',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  }
};