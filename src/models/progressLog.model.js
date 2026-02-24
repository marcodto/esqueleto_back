const { Model } = require('sequelize');

module.exports = class ProgressLog extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        client_id: DataTypes.INTEGER,
        date: DataTypes.DATEONLY,
        weight_kg: DataTypes.FLOAT,
        body_fat_pct: DataTypes.FLOAT,
        photos: DataTypes.JSON,
        notes: DataTypes.TEXT,
      },
      {
        sequelize,
        tableName: 'progress_logs',
        modelName: 'ProgressLog',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'client_id' });
  }
};