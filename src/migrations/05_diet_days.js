'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diet_days', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      diet_plan_id: {
        type: Sequelize.INTEGER,
        references: { model: 'diet_plans', key: 'id' },
        onDelete: 'CASCADE'
      },

      day_number: Sequelize.INTEGER,
      meals: Sequelize.JSON,

      created_at: { allowNull:false, type:Sequelize.DATE },
      updated_at: { allowNull:false, type:Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('diet_days');
  }
};