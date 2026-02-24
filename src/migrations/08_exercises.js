'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exercises', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      workout_day_id: {
        type: Sequelize.INTEGER,
        references: { model: 'workout_days', key: 'id' },
        onDelete: 'CASCADE'
      },

      name: Sequelize.STRING,
      sets: Sequelize.INTEGER,
      reps: Sequelize.STRING,
      rest_seconds: Sequelize.INTEGER,
      notes: Sequelize.TEXT,

      created_at: { allowNull:false, type:Sequelize.DATE },
      updated_at: { allowNull:false, type:Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exercises');
  }
};