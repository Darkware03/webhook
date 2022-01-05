'use strict';

const psql = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('mnt_ruta_rol', {
            id: {
                type: psql.Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_ruta: {
                type: psql.Sequelize.INTEGER,
                references: {
                    model: 'mnt_ruta',
                    key: 'id',
                }
            },
            id_rol: {
                type: psql.Sequelize.INTEGER,
                references: {
                    model: 'mnt_rol',
                    key: 'id',
                }
            },
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('mnt_ruta_rol')
    }
};
