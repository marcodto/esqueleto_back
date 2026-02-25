const { Model } = require('sequelize');

module.exports = class Role extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: DataTypes.STRING,
        description: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: 'roles',
        modelName: 'Role',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.hasMany(models.User, { foreignKey: 'role_id' });
  }
};