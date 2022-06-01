const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('mnt_metodo_autenticacion_usuario', {
      id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: psql.Sequelize.INTEGER,
        references: {
          model: 'mnt_usuario',
          key: 'id',
        },
      },
      id_metodo: {
        type: psql.Sequelize.INTEGER,
        references: {
          model: 'mnt_metodo_autenticacion',
          key: 'id',
        },
      },
      secret_key: {
        type: psql.Sequelize.STRING,
      },
      is_primary: {
        type: psql.Sequelize.BOOLEAN,
      },
      id_auth_method_status: {
        type: psql.Sequelize.INTEGER,
        references: {
          model: 'ctl_auth_method_state',
          key: 'id',
        },
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mnt_metodo_autenticacion_usuario');
  },
};
