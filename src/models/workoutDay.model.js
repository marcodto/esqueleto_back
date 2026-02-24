const { Model } = require('sequelize');

module.exports = class WorkoutDay extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        workout_plan_id: DataTypes.INTEGER,
        day_number: DataTypes.INTEGER,
      },
      {
        sequelize,
        tableName: 'workout_days',
        modelName: 'WorkoutDay',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.WorkoutPlan, { foreignKey: 'workout_plan_id' });
    this.hasMany(models.Exercise, { foreignKey: 'workout_day_id' });
  }
};