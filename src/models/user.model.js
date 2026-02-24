const { Model } = require('sequelize');

module.exports = class User extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true,
        },
        password_hash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('coach', 'client'),
          allowNull: false,
        },
        avatar: DataTypes.STRING,
        rating_avg: {
          type: DataTypes.FLOAT,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: 'users',
        modelName: 'User',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.hasOne(models.ClientProfile, { foreignKey: 'user_id' });

    this.hasMany(models.DietPlan, { foreignKey: 'coach_id' });
    this.hasMany(models.WorkoutPlan, { foreignKey: 'coach_id' });

    this.hasMany(models.ProgressLog, { foreignKey: 'client_id' });

    this.hasMany(models.Subscription, {
      foreignKey: 'client_id',
      as: 'ClientSubscriptions',
    });

    this.hasMany(models.Subscription, {
      foreignKey: 'coach_id',
      as: 'CoachSubscriptions',
    });

    this.hasMany(models.Message, { foreignKey: 'sender_id' });
  }
};