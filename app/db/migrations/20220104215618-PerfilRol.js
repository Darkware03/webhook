const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('mnt_perfil_rol', {
      id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_perfil: {
        type: psql.Sequelize.INTEGER,
        references: {
          model: 'mnt_perfil',
          key: 'id',
        },
      },
      id_rol: {
        type: psql.Sequelize.INTEGER,
        references: {
          model: 'mnt_rol',
          key: 'id',
        },
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mnt_perfil_rol');
  },
};
