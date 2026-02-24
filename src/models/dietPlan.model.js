const { Model } = require('sequelize');

module.exports = class DietPlan extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        coach_id: DataTypes.INTEGER,
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        is_template: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'diet_plans',
        modelName: 'DietPlan',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'coach_id' });
    this.hasMany(models.DietDay, { foreignKey: 'diet_plan_id' });
  }
};