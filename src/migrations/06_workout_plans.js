'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workout_plans', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      coach_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      title: { type: Sequelize.STRING, allowNull: false },

      difficulty: {
        type: Sequelize.ENUM('beginner','intermediate','advanced')
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
    await queryInterface.dropTable('workout_plans');
  }
};