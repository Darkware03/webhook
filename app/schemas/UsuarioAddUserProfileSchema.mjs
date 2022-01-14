const usuarioAddUserProfileSchema = {
  type: 'object',
  properties: {
    perfiles: {
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
  required: ['perfiles'],
  errorMessage: {
    required: {
      perfiles: 'El id del perfil es requerido',
    },
  },
};

export default usuarioAddUserProfileSchema;
