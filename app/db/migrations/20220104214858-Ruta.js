const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('mnt_ruta', {
      id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: psql.Sequelize.STRING(50),
        allowNull: false,
      },
      uri: {
        type: psql.Sequelize.TEXT,
      },
      nombre_uri: {
        type: psql.Sequelize.TEXT,
      },
      mostrar: {
        type: psql.Sequelize.BOOLEAN,
        allowNull: false,
      },
      icono: {
        type: psql.Sequelize.STRING(255),
      },
      orden: {
        type: psql.Sequelize.INTEGER,
      },
      admin: {
        type: psql.Sequelize.BOOLEAN,
      },
      publico: {
        type: psql.Sequelize.BOOLEAN,
      },
      id_ruta_padre: {
        type: psql.Sequelize.INTEGER,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mnt_ruta');
  },
};
