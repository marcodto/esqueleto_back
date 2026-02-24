'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      client_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      coach_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      plan_type: {
        type: Sequelize.ENUM('monthly','quarterly','yearly'),
      },

      status: {
        type: Sequelize.ENUM('active','cancelled','expired'),
        defaultValue: 'active'
      },

      start_date: Sequelize.DATE,
      end_date: Sequelize.DATE,
      amount: Sequelize.FLOAT,

      created_at: { allowNull:false, type:Sequelize.DATE },
      updated_at: { allowNull:false, type:Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('subscriptions');
  }
};