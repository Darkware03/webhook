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
            name: 'SUPER_ADMIN',
          },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );
      const METODOAUTENTICACION = await queryInterface.bulkInsert(
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
      const passwordCrypt = bcrypt.hashSync(process.env.PASSWORD_INICIAL, salt);

      const USUARIO = await queryInterface.bulkInsert(
        'mnt_usuario',
        [
          {
            email: process.env.EMAIL_INICIAL,
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
            id_metodo: METODOAUTENTICACION[0].id,
            secret_key: Speakeasy.generateSecret().base32,
            is_primary: true,
            temporal_key: null,
          },
        ],
        {
          transaction: TRANSACTION,
        },
      );

      /** Aqui */
      const ruta = await queryInterface.bulkInsert(
        'mnt_ruta',
        [
          {
            nombre: 'perfiles',
            uri: '/perfiles/create',
            nombre_uri: 'perfilesCreate',
            mostrar: false,
            icono: 'mdi-account',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'perfiles',
            uri: '/perfiles/list',
            nombre_uri: 'perfilesList',
            mostrar: true,
            icono: 'mdi-account',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'perfiles',
            uri: '/perfiles/edit',
            nombre_uri: 'perfilesEdit',
            mostrar: false,
            icono: 'mdi-account',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'rutas',
            uri: '/rutas/create',
            nombre_uri: 'rutasCreate',
            mostrar: false,
            icono: 'mdi-routes',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'rutas',
            uri: '/rutas/list',
            nombre_uri: 'rutasList',
            mostrar: true,
            icono: 'mdi-routes',
            orden: 2,
            publico: false,
            admin: true,
          },
          {
            nombre: 'rutas',
            uri: '/rutas/edit',
            nombre_uri: 'rutasEdit',
            mostrar: false,
            icono: 'mdi-routes',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'usuarios',
            uri: '/usuarios/create',
            nombre_uri: 'usuariosCreate',
            mostrar: false,
            icono: 'mdi-face-man',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'usuarios',
            uri: '/usuarios/list',
            nombre_uri: 'usuariosList',
            mostrar: true,
            icono: 'mdi-face-man',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'usuarios',
            uri: '/usuarios/edit',
            nombre_uri: 'usuariosEdit',
            mostrar: false,
            icono: 'mdi-face-man',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'roles',
            uri: '/roles/create',
            nombre_uri: 'rolesCreate',
            mostrar: false,
            icono: 'mdi-account-multiple-plus',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'roles',
            uri: '/roles/list',
            nombre_uri: 'rolesList',
            mostrar: true,
            icono: 'mdi-account-group',
            orden: null,
            publico: false,
            admin: true,
          },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );
      // eslint-disable-next-line camelcase
      const role = await queryInterface.bulkInsert(
        'mnt_rol',
        [
          { name: 'ROLE_ADMIN_PERFIL_CREATE' },
          { name: 'ROLE_ADMIN_PERFIL_LIST' },
          { name: 'ROLE_ADMIN_PERFIL_EDIT' },
          { name: 'ROLE_ADMIN_RUTA_CREATE' },
          { name: 'ROLE_ADMIN_RUTA_LIST' },
          { name: 'ROLE_ADMIN_RUTA_EDIT' },
          { name: 'ROLE_ADMIN_USER_CREATE' },
          { name: 'ROLE_ADMIN_USER_LIST' },
          { name: 'ROLE_ADMIN_USER_EDIT' },
          { name: 'ROLE_ADMIN_ROLE_CREATE' },
          { name: 'ROLE_ADMIN_ROLE_LIST' },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );
      await queryInterface.bulkInsert(
        'mnt_ruta_rol',
        [
          {
            id_ruta: ruta[0].id,
            id_rol: role[0].id,
          },
          {
            id_ruta: ruta[1].id,
            id_rol: role[1].id,
          },
          {
            id_ruta: ruta[2].id,
            id_rol: role[2].id,
          },
          {
            id_ruta: ruta[3].id,
            id_rol: role[3].id,
          },
          {
            id_ruta: ruta[4].id,
            id_rol: role[4].id,
          },
          {
            id_ruta: ruta[5].id,
            id_rol: role[5].id,
          },
          {
            id_ruta: ruta[6].id,
            id_rol: role[6].id,
          },
          {
            id_ruta: ruta[7].id,
            id_rol: role[7].id,
          },
          {
            id_ruta: ruta[8].id,
            id_rol: role[8].id,
          },
          {
            id_ruta: ruta[9].id,
            id_rol: role[9].id,
          },
          {
            id_ruta: ruta[10].id,
            id_rol: role[10].id,
          },
        ],
        { transaction: TRANSACTION },
      );

      const roles = [
        { name: 'ROLE_ADMIN_PERFIL_DELETE' }, // 0
        { name: 'ROLE_ADMIN_ROLE_DELETE' }, // 1
        { name: 'ROLE_ADMIN_ROLE_EDIT' }, // 2
        { name: 'ROLE_ADMIN_RUTA_DELETE' }, // 3
        { name: 'ROLE_ADMIN_USER_DELETE' }, // 4
        { name: 'ROLE_ADMIN_USER_VIEW' }, // 5
        { name: 'ROLE_SUPER_ADMIN' }, // 6
        { name: 'ROLE_PERFIL_LIST' }, // 7
        { name: 'ROLE_PERFIL_CREATE' }, // 8
        { name: 'ROLE_PERFIL_UPDATE' }, // 9
        { name: 'ROLE_PERFIL_DELETE' }, // 10
        { name: 'ROLE_PERFIL_ROL_CREATE' }, // 11
        { name: 'ROLE_PERFIL_ROL_DELETE' }, // 12
        { name: 'ROLE_ROL_LIST' }, // 13
        { name: 'ROLE_ROL_CREATE' }, // 14
        { name: 'ROLE_ROL_UPDATE' }, // 15
        { name: 'ROLE_ROL_DELETE' }, // 16
        { name: 'ROLE_RUTA_LIST' }, // 17
        { name: 'ROLE_RUTA_CREATE' }, // 18
        { name: 'ROLE_RUTA_LIST' }, // 19
        { name: 'ROLE_RUTA_ROL_CREATE' }, // 20
        { name: 'ROLE_RUTA_UPDATE' }, // 21
        { name: 'ROLE_RUTA_DELETE' }, // 22
        { name: 'ROLE_RUTA_ROL_DELETE' }, // 23
        { name: 'ROLE_USER_METHOD_LIST' }, // 24
        { name: 'ROLE_USER_LIST' }, // 25
        { name: 'ROLE_USER_PERFIL_CREATE' }, // 26
        { name: 'ROLE_USER_PERFIL_DELETE' }, // 27
        { name: 'ROLE_USER_ROL_DELETE' }, // 28
        { name: 'ROLE_USER_UPDATE' }, // 29
        { name: 'ROLE_USER_DELETE' }, // 30
        { name: 'ROLE_USER_CREATE' }, // 31
        { name: 'ROLE_USER_PERFIL_LIST' }, // 32
        { name: 'ROLE_USER_PASSWORD_UPDATE' }, // 33
        { name: 'ROLE_USER_EMAIL_DELETE' }, // 34
      ];

      const rutas = [
        {
          nombre: 'perfil',
          uri: '/perfil',
          nombre_uri: 'perfil',
          mostrar: false,
          icono: 'mdi-account-lock',
          orden: null,
          publico: true,
          admin: true,
        },
        {
          nombre: 'seguridad',
          uri: '/seguridad',
          nombre_uri: 'seguridad',
          mostrar: false,
          icono: null,
          orden: null,
          publico: false,
          admin: false,
        },
        {
          nombre: 'dashboard',
          uri: '/',
          nombre_uri: 'dashboard',
          mostrar: true,
          icono: 'mdi-home',
          orden: 5,
          publico: true,
          admin: false,
        },
      ];

      /** Otras Rutas */
      await queryInterface.bulkInsert('mnt_ruta', rutas, {
        returning: ['id'],
        transaction: TRANSACTION,
      });

      /** Otros Roles */
      const rolesUsuario = await queryInterface.bulkInsert('mnt_rol', roles, {
        returning: ['id'],
        transaction: TRANSACTION,
      });

      /** Perfil */
      const perfil = await queryInterface.bulkInsert(
        'mnt_perfil',
        [
          {
            nombre: 'SUPER_ADMIN',
            codigo: '1',
          },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );

      /** Otros roles con perfil */
      await queryInterface.bulkInsert(
        'mnt_perfil_rol',
        [
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[0].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[1].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[2].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[3].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[4].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[5].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[6].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[7].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[8].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[9].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[10].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[11].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[12].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[13].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[14].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[15].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[16].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[17].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[18].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[19].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[20].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[21].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[22].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[23].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[24].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[25].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[26].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[27].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[28].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[29].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[30].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[31].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[32].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[33].id,
          },
          {
            id_perfil: perfil[0].id,
            id_rol: rolesUsuario[34].id,
          },
        ],
        {
          transaction: TRANSACTION,
        },
      );

      /** Perfil relacionar con Usuario */
      await queryInterface.bulkInsert(
        'mnt_usuario_perfil',
        [
          {
            id_perfil: perfil[0].id,
            id_usuario: USUARIO[0].id,
          },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );
      await TRANSACTION.commit();
    } catch (e) {
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
