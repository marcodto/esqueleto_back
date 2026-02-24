'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Usuarios', {
      usuario_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      nombre: {
        type: Sequelize.STRING,
      },
      apellido: {
        type: Sequelize.STRING,
      },
      usuario: {
        type: Sequelize.STRING,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
      },
      telefono: {
        allowNull: true,
        type: Sequelize.STRING(13),
      },
      password: {
        type: Sequelize.STRING(100),
      },
      direccion: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      estado: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      ciudad: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      codigo_postal: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      estatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      es_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      cantidad_invitados: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Usuarios');
  },
};
