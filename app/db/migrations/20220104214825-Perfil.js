const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('mnt_perfil', {
      id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: psql.Sequelize.STRING(30),
        allowNull: false,
      },
      codigo: {
        type: psql.Sequelize.STRING(5),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mnt_perfil');
  },
};
