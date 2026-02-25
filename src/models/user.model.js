const { Model } = require('sequelize');

module.exports = class User extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        first_name:    DataTypes.STRING,
        last_name:     DataTypes.STRING,
        email:         DataTypes.STRING,
        password_hash: DataTypes.STRING,
        avatar:        DataTypes.STRING,
        phone:         DataTypes.STRING,
        city:          DataTypes.STRING,
        state:         DataTypes.STRING,
        is_active:     DataTypes.BOOLEAN,
        role_id:       DataTypes.INTEGER,
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
    this.hasOne(models.ClientProfile, { foreignKey: 'user_id' });
    this.hasMany(models.Conversation, { as: 'coachConversations', foreignKey: 'coach_id' });
    this.hasMany(models.Conversation, { as: 'clientConversations', foreignKey: 'client_id' });
  }
};