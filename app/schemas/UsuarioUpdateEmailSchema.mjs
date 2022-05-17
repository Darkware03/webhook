const usuarioUpdateEmailSchema = {
  $id: 'http://example.com/schemas/usuarioUpdateEmailSchema.json#',
  type: 'object',
  properties: {
    email: {
      $ref: 'defs.json#/definitions/email',
    },
    password: {
      $ref: 'defs.json#/definitions/password',
    },
  },
  required: ['email', 'password'],
  errorMessage: {
    required: {
      email: 'El campo email de la ruta es requerido',
      password: 'El campo password de la ruta es requerido',
    },
  },
};

export default usuarioUpdateEmailSchema;
