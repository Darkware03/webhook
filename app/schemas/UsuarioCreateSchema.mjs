const usuarioCreateSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      errorMessage: {
        type: 'La contraseña del usuario debe ser de tipo alfanumerico',
      },
    },
    email: {
      type: 'string',
      errorMessage: {
        type: 'El email del usuario debe ser de tipo alfanumerico',
      },
    },
    perfiles: {
      type: 'array',
      uniqueItems: true,
      minItems: 0,
      items: {
        type: 'integer',
      },
      errorMessage: {
        type: 'El id del perfil debe ser de tipo entero',
      },
    },
    roles: {
      type: 'array',
      uniqueItems: true,
      minItems: 0,
      items: {
        type: 'integer',
      },
      errorMessage: {
        type: 'El id del rol debe ser de tipo entero',
      },
    },
  },
  anyOf: [{ required: ['roles'], errorMessage: { required: 'Debe poseer un rol o un pefil' } }, { required: ['perfiles'], errorMessage: { required: 'Debe poseer un rol o un pefil' } }],
  required: ['password', 'email'],
  errorMessage: {
    required: {
      password: 'El campo de contraseña del usuario es requerido',
      email: 'El campo de email del usuario es requerido',
    },
  },
};

export default usuarioCreateSchema;
