'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diet_plans', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      coach_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false
      },

      is_template: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      created_at: { allowNull:false, type:Sequelize.DATE },
      updated_at: { allowNull:false, type:Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('diet_plans');
  }
};