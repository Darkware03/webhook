const bcrypt = require('bcryptjs');
const Speakeasy = require('speakeasy');

module.exports = {
  up: async (queryInterface) => {
    const TRANSACTION = await queryInterface.sequelize.transaction();

    try {
      const salt = bcrypt.genSaltSync();

      const [PROFILE] = await queryInterface.bulkInsert(
        'mnt_perfil',
        [
          {
            nombre: 'SUPER_ADMIN',
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

      const [USUARIO] = await queryInterface.bulkInsert(
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
        'mnt_metodo_autenticacion_usuario',
        [
          {
            id_usuario: USUARIO.id,
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

      const [backend, admin] = await queryInterface.bulkInsert('ctl_tipo_rol', [
        { name: 'Backend' },
        { name: 'Admin' },
        { name: 'Frontend' },
      ], {
        returning: ['id'],
        transaction: TRANSACTION,
      });

      /**
             * ROLES PARA EL BACKEND
             * */
      const ROLES = await queryInterface.bulkInsert(
        'mnt_rol',
        [
          // Roles de perfil
          { name: 'ROLE_PROFILE_LIST', id_tipo_rol: backend.id },
          { name: 'ROLE_PROFILE_CREATE', id_tipo_rol: backend.id },
          { name: 'ROLE_PROFILE_UPDATE', id_tipo_rol: backend.id },
          { name: 'ROLE_PROFILE_DELETE', id_tipo_rol: backend.id },
          { name: 'ROLE_PROFILE_ROLE_CREATE', id_tipo_rol: backend.id },
          { name: 'ROLE_PROFILE_ROLE_DELETE', id_tipo_rol: backend.id },
          // Roles de rol :(
          { name: 'ROLE_ROLE_LIST', id_tipo_rol: backend.id },
          { name: 'ROLE_ROLE_CREATE', id_tipo_rol: backend.id },
          { name: 'ROLE_ROLE_UPDATE', id_tipo_rol: backend.id },
          { name: 'ROLE_ROLE_DELETE', id_tipo_rol: backend.id },
          // Roles de ruta
          { name: 'ROLE_PATH_LIST', id_tipo_rol: backend.id },
          { name: 'ROLE_PATH_CREATE', id_tipo_rol: backend.id },
          { name: 'ROLE_PATH_UPDATE', id_tipo_rol: backend.id },
          { name: 'ROLE_PATH_DELETE', id_tipo_rol: backend.id },
          { name: 'ROLE_PATH_ROLE_CREATE', id_tipo_rol: backend.id },
          { name: 'ROLE_PATH_ROLE_DELETE', id_tipo_rol: backend.id },
          // Roles de Usuario
          { name: 'ROLE_USER_LIST', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_CREATE', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_UPDATE', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_DELETE', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_AUTH_METHOD_LIST', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_PROFILE_LIST', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_PROFILE_CREATE', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_PROFILE_DELETE', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_ROLE_LIST', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_ROLE_CREATE', id_tipo_rol: backend.id },
          { name: 'ROLE_USER_ROLE_DELETE', id_tipo_rol: backend.id },

          /**
                     * ROLES PARA EL ADMIN
                     * */
          { name: 'ROLE_ADMIN_PROFILE_DELETE', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_ROLE_DELETE', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_PATH_DELETE', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_USER_DELETE', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_ROLE_UPDATE', id_tipo_rol: admin.id },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );

      /**
             * ROLES PARA LAS RUTAS DEL ADMIN
             * */
      const ROLES_RUTAS_ADMIN = await queryInterface.bulkInsert(
        'mnt_rol',
        [
          { name: 'ROLE_ADMIN_DASHBOARD_VIEW', id_tipo_rol: admin.id },
          // Roles de perfil
          { name: 'ROLE_ADMIN_PROFILE_LIST', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_PROFILE_CREATE', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_PROFILE_UPDATE', id_tipo_rol: admin.id },
          // Roles de rol :(
          { name: 'ROLE_ADMIN_ROLE_LIST', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_ROLE_CREATE', id_tipo_rol: admin.id },
          // Roles de ruta
          { name: 'ROLE_ADMIN_PATH_LIST', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_PATH_CREATE', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_PATH_UPDATE', id_tipo_rol: admin.id },
          // Roles de Usuario
          { name: 'ROLE_ADMIN_USER_LIST', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_USER_CREATE', id_tipo_rol: admin.id },
          { name: 'ROLE_ADMIN_USER_UPDATE', id_tipo_rol: admin.id },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );

      const RUTAS = await queryInterface.bulkInsert(
        'mnt_ruta',
        [
          {
            nombre: 'dashboard',
            uri: '/',
            nombre_uri: 'dashboard',
            mostrar: true,
            icono: 'mdi-home',
            orden: 1,
            publico: false,
            admin: true,
          },
          {
            nombre: 'perfiles',
            uri: '/perfiles/list',
            nombre_uri: 'perfilesList',
            mostrar: true,
            icono: 'mdi-account',
            orden: 2,
            publico: false,
            admin: true,
          },
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
            uri: '/perfiles/edit',
            nombre_uri: 'perfilesEdit',
            mostrar: false,
            icono: 'mdi-account',
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
            uri: '/usuarios/edit',
            nombre_uri: 'usuariosEdit',
            mostrar: false,
            icono: 'mdi-face-man',
            orden: null,
            publico: false,
            admin: true,
          },
          {
            nombre: 'perfil',
            uri: '/perfil',
            nombre_uri: 'perfil',
            mostrar: false,
            icono: 'mdi-account-lock',
            orden: null,
            publico: false,
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
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );

      // ASIGNAR ROLES AL PERFIL ADMIN
      await queryInterface.bulkInsert(
        'mnt_perfil_rol',
        ROLES.concat(ROLES_RUTAS_ADMIN).map((role) => ({
          id_perfil: PROFILE.id,
          id_rol: role.id,
        })),
        {
          transaction: TRANSACTION,
        },
      );

      await queryInterface.bulkInsert(
        'mnt_ruta_rol',
        ROLES_RUTAS_ADMIN.map((role, index) => ({
          id_ruta: RUTAS[index].id,
          id_rol: role.id,
        })),
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );

      /** Perfil relacionar con Usuario */
      await queryInterface.bulkInsert(
        'mnt_usuario_perfil',
        [
          {
            id_perfil: PROFILE.id,
            id_usuario: USUARIO.id,
          },
        ],
        {
          returning: ['id'],
          transaction: TRANSACTION,
        },
      );
      await TRANSACTION.commit();
    } catch (e) {
      console.log(e);
      await TRANSACTION.rollback();
    }
  },

  down: async (queryInterface) => {
    /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */

    await Promise.all([
      queryInterface.bulkDelete('mnt_usuario_perfil', null, {}),
      queryInterface.bulkDelete('mnt_ruta_rol', null, {}),
      queryInterface.bulkDelete('mnt_perfil_rol', null, {}),
      queryInterface.bulkDelete('mnt_ruta', null, {}),
      queryInterface.bulkDelete('mnt_rol', null, {}),
      queryInterface.bulkDelete('ctl_tipo_rol', null, {}),
      queryInterface.bulkDelete('mnt_metodo_autenticacion_usuario', null, {}),
      queryInterface.bulkDelete('refresh_tokens', null, {}),
      queryInterface.bulkDelete('mnt_usuario', null, {}),
      queryInterface.bulkDelete('mnt_metodo_autenticacion', null, {}),
      queryInterface.bulkDelete('mnt_perfil', null, {}),
    ]);
  },
};
