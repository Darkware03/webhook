const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('mnt_usuario_rol', {
      id_usuario: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'mnt_usuario',
          key: 'id',
        },
      },
      id_rol: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'mnt_rol',
          key: 'id',
        },
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mnt_usuario_rol');
  },
};
