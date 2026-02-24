const { Model } = require('sequelize');

module.exports = class Exercise extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        workout_day_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        sets: DataTypes.INTEGER,
        reps: DataTypes.STRING,
        rest_seconds: DataTypes.INTEGER,
        notes: DataTypes.TEXT,
      },
      {
        sequelize,
        tableName: 'exercises',
        modelName: 'Exercise',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.WorkoutDay, { foreignKey: 'workout_day_id' });
  }
};