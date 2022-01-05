'use strict';

const psql = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('mnt_rol', {
            id: {
                type: psql.Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: psql.Sequelize.STRING(255),
                allowNull: false
            },
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('mnt_rol')
    }
};
