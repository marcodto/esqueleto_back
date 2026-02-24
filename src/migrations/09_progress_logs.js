'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('progress_logs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      client_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      date: Sequelize.DATEONLY,
      weight_kg: Sequelize.FLOAT,
      body_fat_pct: Sequelize.FLOAT,
      photos: Sequelize.JSON,
      notes: Sequelize.TEXT,

      created_at: { allowNull:false, type:Sequelize.DATE },
      updated_at: { allowNull:false, type:Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('progress_logs');
  }
};