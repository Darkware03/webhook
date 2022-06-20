const recoveryPasswordSchema = {
  $id: 'http://example.com/schemas/recoveryPasswordSchema.json#',
  type: 'object',
  properties: {
    password: {
      $ref: 'defs.json#/definitions/password',
    },
    confirm_password: {
      $ref: 'defs.json#/definitions/password',
    },
  },
  required: ['password', 'confirm_password'],
  errorMessage: {
    required: {
      password: 'El campo password es requerido',
      confirm_password: 'El campo confirmPassword es requerido',
    },
  },
};

export default recoveryPasswordSchema;
