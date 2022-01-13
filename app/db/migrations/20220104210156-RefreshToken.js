const psql = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: psql.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      refresh_token: {
        type: psql.Sequelize.STRING,
      },
      id_usuario: {
        type: psql.Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mnt_usuario',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      valid: {
        type: psql.Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('refresh_tokens');
  },
};
