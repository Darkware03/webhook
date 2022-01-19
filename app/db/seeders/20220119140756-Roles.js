module.exports = {
  up: async (queryInterface) => {
    const TRANSACTION = await queryInterface.sequelize.transaction();
    try {
      const roles = [
        { name: 'ROLE_ADMIN_PERFIL_CREATE' },
        { name: 'ROLE_ADMIN_PERFIL_DELETE' },
        { name: 'ROLE_ADMIN_PERFIL_EDIT' },
        { name: 'ROLE_ADMIN_PERFIL_LIST' },
        { name: 'ROLE_ADMIN_ROLE_CREATE' },
        { name: 'ROLE_ADMIN_ROLE_DELETE' },
        { name: 'ROLE_ADMIN_ROLE_EDIT' },
        { name: 'ROLE_ADMIN_ROLE_LIST' },
        { name: 'ROLE_ADMIN_RUTA_CREATE' },
        { name: 'ROLE_ADMIN_RUTA_DELETE' },
        { name: 'ROLE_ADMIN_RUTA_EDIT' },
        { name: 'ROLE_ADMIN_RUTA_LIST' },
        { name: 'ROLE_ADMIN_USER_CREATE' },
        { name: 'ROLE_ADMIN_USER_DELETE' },
        { name: 'ROLE_ADMIN_USER_EDIT' },
        { name: 'ROLE_ADMIN_USER_LIST' },
        { name: 'ROLE_ADMIN_USER_VIEW' },
        { name: 'ROLE_SUPER_ADMIN' }];

      await queryInterface.bulkInsert(
        'mnt_rol',
        roles,
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
