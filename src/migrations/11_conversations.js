'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      created_at: { allowNull:false, type:Sequelize.DATE },
      updated_at: { allowNull:false, type:Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('conversations');
  }
};