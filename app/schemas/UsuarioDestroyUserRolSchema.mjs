const usuarioDestroyUserRolSchema = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      uniqueItems: true,
      minItems: 1,
      items: {
        type: 'integer',
      },
      errorMessage: {
        type: 'El id del perfil debe ser de tipo entero',
      },
    },
  },
  required: ['roles'],
  errorMessage: {
    required: {
      roles: 'El id del perfil es requerido',
    },
  },
};

export default usuarioDestroyUserRolSchema;
