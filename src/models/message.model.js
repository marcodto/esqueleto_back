const { Model } = require('sequelize');

module.exports = class Message extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        conversation_id: DataTypes.INTEGER,
        sender_id: DataTypes.INTEGER,
        content: DataTypes.TEXT,
        type: {
          type: DataTypes.ENUM('text', 'ai'),
          defaultValue: 'text',
        },
        read_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: 'messages',
        modelName: 'Message',
        underscored: true,
      },
    );
  }

  static associate(models) {
    this.belongsTo(models.Conversation, {
      foreignKey: 'conversation_id',
    });

    this.belongsTo(models.User, {
      foreignKey: 'sender_id',
    });
  }
};
