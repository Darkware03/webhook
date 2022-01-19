module.exports = {
  up: async (queryInterface) => {
    const TRANSACTION = await queryInterface.sequelize.transaction();
    try {
      const rutas = [
        {
          nombre: 'perfil',
          uri: '/perfil',
          nombre_uri: 'perfil',
          mostrar: false,
          icono: 'mdi-account-lock',
          orden: null,
          publico: true,
        },
        {
          nombre: 'seguridad',
          uri: '/seguridad',
          nombre_uri: 'seguridad',
          mostrar: false,
          icono: null,
          orden: null,
          publico: false,
        },
        {
          nombre: 'rutas',
          uri: '/rutas/list',
          nombre_uri: 'rutasList',
          mostrar: true,
          icono: 'mdi-routes',
          orden: 2,
          publico: false,
        },
        {
          nombre: 'perfiles',
          uri: '/perfiles/create',
          nombre_uri: 'perfilesCreate',
          mostrar: false,
          icono: 'mdi-account',
          orden: null,
          publico: false,
        },
        {
          nombre: 'perfiles',
          uri: '/perfiles/edit',
          nombre_uri: 'perfilesEdit',
          mostrar: false,
          icono: 'mdi-account',
          orden: null,
          publico: false,
        },
        {
          nombre: 'perfiles',
          uri: '/perfiles/list',
          nombre_uri: 'perfilesList',
          mostrar: true,
          icono: 'mdi-account',
          orden: null,
          publico: false,
        },
        {
          nombre: 'rutas',
          uri: '/rutas/create',
          nombre_uri: 'rutasCreate',
          mostrar: false,
          icono: 'mdi-routes',
          orden: null,
          publico: false,
        },
        {
          nombre: 'rutas',
          uri: '/rutas/edit',
          nombre_uri: 'rutasEdit',
          mostrar: false,
          icono: 'mdi-routes',
          orden: null,
          publico: false,
        },
        {
          nombre: 'dashboard',
          uri: '/',
          nombre_uri: 'dashboard',
          mostrar: true,
          icono: 'mdi-home',
          orden: 5,
          publico: true,
        },
        {
          nombre: 'usuarios',
          uri: '/usuarios/create',
          nombre_uri: 'usuariosCreate',
          mostrar: false,
          icono: 'mdi-face-man',
          orden: null,
          publico: false,
        },
        {
          nombre: 'usuarios',
          uri: '/usuarios/edit',
          nombre_uri: 'usuariosEdit',
          mostrar: false,
          icono: 'mdi-face-man',
          orden: null,
          publico: false,
        },
        {
          nombre: 'roles',
          uri: '/roles/list',
          nombre_uri: 'rolesList',
          mostrar: true,
          icono: 'mdi-account-group',
          orden: null,
          publico: false,
        },
        {
          nombre: 'roles',
          uri: '/roles/create',
          nombre_uri: 'rolesCreate',
          mostrar: false,
          icono: 'mdi-account-multiple-plus',
          orden: null,
          publico: false,
        },
        {
          nombre: 'usuarios',
          uri: '/usuarios/list',
          nombre_uri: 'usuariosList',
          mostrar: true,
          icono: 'mdi-face-man',
          orden: null,
          publico: false,
        }];

      await queryInterface.bulkInsert(
        'mnt_ruta',
        rutas,
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

  down: async () => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
