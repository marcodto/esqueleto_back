const { Model } = require('sequelize');

module.exports = class DietDay extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        diet_plan_id: DataTypes.INTEGER,
        day_number: DataTypes.INTEGER,
        meals: DataTypes.JSON,
      },
      {
        sequelize,
        tableName: 'diet_days',
        modelName: 'DietDay',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.DietPlan, { foreignKey: 'diet_plan_id' });
  }
};