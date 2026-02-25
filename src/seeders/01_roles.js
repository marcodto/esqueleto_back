'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      {
        name: 'coach',
        description: 'Entrenador que crea planes y gestiona clientes',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'client',
        description: 'Cliente que sigue planes asignados por su coach',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', { name: ['coach', 'client'] });
  }
};