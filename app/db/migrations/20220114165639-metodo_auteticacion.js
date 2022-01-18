const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('mnt_metodo_autenticacion', {
      id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: psql.Sequelize.STRING,
      },
      descripcion: {
        type: psql.Sequelize.STRING,
      },
      icono: {
        type: psql.Sequelize.STRING,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mnt_metodo_autenticacion');
  },
};
