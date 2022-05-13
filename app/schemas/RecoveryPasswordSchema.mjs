const recoveryPasswordSchema = {
  $id: 'http://example.com/schemas/recoveryPasswordSchema.json#',
  type: 'object',
  properties: {
    password: {
      $ref: 'defs.json#/definitions/password',
    },
    confirmPassword: {
      $ref: 'defs.json#/definitions/password',
    },
  },
  required: ['password', 'confirmPassword'],
  errorMessage: {
    required: {
      password: 'El campo password es requerido',
      confirmPassword: 'El campo confirmPassword es requerido',
    },
  },
};

export default recoveryPasswordSchema;
