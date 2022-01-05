'use strict';

const psql = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('mnt_usuario_perfil', {
            id: {
                type: psql.Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_perfil: {
                type: psql.Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'mnt_perfil',
                    key: 'id',
                }
            },
            id_usuario: {
                type: psql.Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'mnt_usuario',
                    key: 'id',
                }
            }
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('mnt_usuario_perfil')
    }
};
