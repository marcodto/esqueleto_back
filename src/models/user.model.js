const { Model } = require('sequelize');

module.exports = class User extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password_hash: DataTypes.STRING,
        avatar: DataTypes.STRING,
        role_id: DataTypes.INTEGER,
      },
      {
        sequelize,
        tableName: 'users',
        modelName: 'User',
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });

    // Asociaciones existentes que tengas
    this.hasOne(models.ClientProfile, { foreignKey: 'user_id' });
    this.hasMany(models.Conversation, { as: 'coachConversations', foreignKey: 'coach_id' });
    this.hasMany(models.Conversation, { as: 'clientConversations', foreignKey: 'client_id' });
  }
};