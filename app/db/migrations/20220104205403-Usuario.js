const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('mnt_usuario', {
      id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: psql.Sequelize.STRING,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: psql.Sequelize.TEXT,
      },
      last_login: {
        type: psql.Sequelize.STRING,
      },
      is_suspended: {
        type: psql.Sequelize.BOOLEAN,
        defaultValue: false,
      },
      token_valid_after: {
        type: psql.Sequelize.STRING,
      },
      two_factor_status: { type: psql.Sequelize.BOOLEAN },
      created_at: {
        type: psql.Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mnt_usuario');
  },
};
