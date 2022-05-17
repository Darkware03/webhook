const usuarioPasswordUpdate = {
  $id: 'http://example.com/schemas/usuarioPasswordUpdate.json#',
  type: 'object',
  properties: {
    password_actual: {
      $ref: 'defs.json#/definitions/string',
    },
    password: {
      $ref: 'defs.json#/definitions/password',
    },
    confirm_password: {
      $ref: 'defs.json#/definitions/password',
    },
  },
  required: ['password_actual', 'password', 'confirm_password'],
  errorMessage: {
    required: {
      password_actual: 'La contraseña actual es requerida',
      password: 'Debe proporcionar una nueva contraseña',
      confirm_password: 'Debe confirmar la contraseña',
    },
  },
};

export default usuarioPasswordUpdate;
