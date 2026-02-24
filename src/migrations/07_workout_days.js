'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workout_days', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      workout_plan_id: {
        type: Sequelize.INTEGER,
        references: { model: 'workout_plans', key: 'id' },
        onDelete: 'CASCADE'
      },

      day_number: Sequelize.INTEGER,

      created_at: { allowNull:false, type:Sequelize.DATE },
      updated_at: { allowNull:false, type:Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('workout_days');
  }
};