const loginSchema = {
  $id: 'http://example.com/schemas/login.json#',
  type: 'object',
  properties: {
    email: {
      $ref: 'defs.json#/definitions/email',
      errorMessage: {
        email: 'El email debe ser de tipo alfanumerico',
      },
    },
    password: {
      $ref: 'defs.json#/definitions/fechaMenorActual',
    },
  },
  required: ['email', 'password'],
  errorMessage: {
    required: {
      email: 'El email es requerido',
      password: 'La contraseña es requerida',
    },
  },

};

export default loginSchema;
