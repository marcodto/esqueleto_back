const { Model } = require('sequelize');

module.exports = class Subscription extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        client_id: DataTypes.INTEGER,
        coach_id: DataTypes.INTEGER,
        plan_type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
        status: {
          type: DataTypes.ENUM('active', 'cancelled', 'expired'),
          defaultValue: 'active',
        },
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        amount: DataTypes.FLOAT,
      },
      {
        sequelize,
        tableName: 'subscriptions',
        modelName: 'Subscription',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { as: 'client', foreignKey: 'client_id' });
    this.belongsTo(models.User, { as: 'coach', foreignKey: 'coach_id' });
  }
};