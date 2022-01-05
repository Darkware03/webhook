'use strict';
const bcrypt = require('bcryptjs')

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const TRANSACTION = await queryInterface.sequelize.transaction()

        try {
            const salt = bcrypt.genSaltSync();

            const ROL = await queryInterface.bulkInsert('mnt_rol', [{
                name: 'SUPER-ADMIN'
            }], {
                returning: ["id"],
                transaction: TRANSACTION
            })


            const password_crypt = bcrypt.hashSync('admin', salt);

            const USUARIO = await queryInterface.bulkInsert('mnt_usuario', [{
                email: 'admin@salud.gob.sv',
                password: password_crypt,
                is_suspended: false,
            }], {
                returning: ['id'],
                transaction: TRANSACTION
            })

            await queryInterface.bulkInsert('mnt_usuario_rol', [{
                id_usuario: USUARIO[0].id,
                id_rol: ROL[0].id
            }],{
                transaction:TRANSACTION
            })

            await TRANSACTION.commit()

        } catch (e) {
            console.log(e)
            await TRANSACTION.rollback()
        }
    },

    down: async (queryInterface, Sequelize) => {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    }
};
