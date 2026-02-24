'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('goals', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      client_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },

      title: Sequelize.STRING,
      target_value: Sequelize.FLOAT,
      unit: Sequelize.STRING,
      deadline: Sequelize.DATE,

      status: {
        type: Sequelize.ENUM('active', 'completed', 'failed'),
        defaultValue: 'active',
      },

      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('goals');
  },
};
