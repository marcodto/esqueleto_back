'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      conversation_id: {
        type: Sequelize.INTEGER,
        references: { model: 'conversations', key: 'id' },
        onDelete: 'CASCADE'
      },

      sender_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      content: Sequelize.TEXT,

      type: {
        type: Sequelize.ENUM('text','ai'),
        defaultValue: 'text'
      },

      read_at: Sequelize.DATE,

      created_at: { allowNull:false, type:Sequelize.DATE },
      updated_at: { allowNull:false, type:Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  }
};