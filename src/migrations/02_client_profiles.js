'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('client_profiles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      weight: Sequelize.FLOAT,
      height: Sequelize.FLOAT,
      goal: Sequelize.STRING,
      allergies: Sequelize.JSON,
      food_preferences: Sequelize.JSON,
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('client_profiles');
  }
};