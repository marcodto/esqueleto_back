const { Model } = require('sequelize');

module.exports = class Goal extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        client_id: DataTypes.INTEGER,
        title: DataTypes.STRING,
        target_value: DataTypes.FLOAT,
        unit: DataTypes.STRING,
        deadline: DataTypes.DATE,
        status: {
          type: DataTypes.ENUM('active', 'completed', 'failed'),
          defaultValue: 'active',
        },
      },
      {
        sequelize,
        tableName: 'goals',
        modelName: 'Goal',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'client_id' });
  }
};