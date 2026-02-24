const { Model } = require('sequelize');

module.exports = class WorkoutPlan extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        coach_id: DataTypes.INTEGER,
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        difficulty: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        is_template: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'workout_plans',
        modelName: 'WorkoutPlan',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'coach_id' });
    this.hasMany(models.WorkoutDay, { foreignKey: 'workout_plan_id' });
  }
};