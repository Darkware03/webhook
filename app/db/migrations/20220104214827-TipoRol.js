const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('ctl_tipo_rol', {
      id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: psql.Sequelize.STRING(255),
        allowNull: false,
      },
      prefijo: {
        type: psql.Sequelize.STRING(255),
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ctl_tipo_rol');
  },
};
