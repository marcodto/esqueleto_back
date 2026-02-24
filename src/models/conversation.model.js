const { Model } = require('sequelize');

module.exports = class Conversation extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        coach_id: DataTypes.INTEGER,
        client_id: DataTypes.INTEGER,
      },
      {
        sequelize,
        tableName: 'conversations',
        modelName: 'Conversation',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { as: 'coach', foreignKey: 'coach_id' });
    this.belongsTo(models.User, { as: 'client', foreignKey: 'client_id' });

    this.hasMany(models.Message, { foreignKey: 'conversation_id' });
  }
};