'use strict';

const { compareAsync, hashSaltAsync } = require('../utils/bcrypt');
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const pass = await hashSaltAsync('12345678', 10);

    await queryInterface.bulkInsert('Usuarios', [
      {
        usuario_id: 1,
        nombre: 'Marco',
        apellido: 'Davila',
        usuario: 'admin',
        email: 'madato_app@hotmail.com',
        password: pass,
        estatus:1,
        es_admin:true,
        cantidad_invitados:0,
        createdAt: Sequelize.fn('now'),
        updatedAt: Sequelize.fn('now'),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Usuarios', null, {});
  },
};
