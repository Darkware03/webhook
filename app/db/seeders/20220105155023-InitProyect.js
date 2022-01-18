const bcrypt = require('bcryptjs');
const Speakeasy = require('speakeasy');

module.exports = {
  up: async (queryInterface) => {
    const TRANSACTION = await queryInterface.sequelize.transaction();

    try {
      const salt = bcrypt.genSaltSync();

      const ROL = await queryInterface.bulkInsert(
        'mnt_rol',
        [
          {
            name: 'SUPER-ADMIN',
          },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );
      await queryInterface.bulkInsert(
        'mnt_metodo_autenticacion',
        [
          {
            nombre: 'Correo Electrónico',
            descripcion: 'Envío de codigo de seguridad por correo electrónico',
            icono: 'mdi-email',
          },
          {
            nombre: 'Código QR',
            descripcion: 'Creacion de código mediante Autenticador de Google',
            icono: 'mdi-qrcode',
          },
        ],
        { returning: ['id'], transaction: TRANSACTION },
      );
      const passwordCrypt = bcrypt.hashSync('admin', salt);

      const USUARIO = await queryInterface.bulkInsert(
        'mnt_usuario',
        [
          {
            email: 'admin@salud.gob.sv',
            password: passwordCrypt,
            is_suspended: false,
          },
        ],
        {
          returning: ['id', 'email'],
          transaction: TRANSACTION,
        },
      );
      await queryInterface.bulkInsert(
        'mnt_usuario_rol',
        [
          {
            id_usuario: USUARIO[0].id,
            id_rol: ROL[0].id,
          },
        ],
        {
          transaction: TRANSACTION,
        },
      );

      await queryInterface.bulkInsert(
        'mnt_metodo_autenticacion_usuario',
        [
          {
            id_usuario: USUARIO[0].id,
            id_metodo: 1,
            secret_key: Speakeasy.generateSecret().base32,
            is_primary: true,
            temporal_key: null,
          },
        ],
        {
          transaction: TRANSACTION,
        },
      );
      await TRANSACTION.commit();
    } catch (e) {
      console.log(e);
      await TRANSACTION.rollback();
    }
  },

  down: async () => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
