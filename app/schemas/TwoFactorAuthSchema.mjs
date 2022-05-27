const twoFactorAuthSchema = {
  $id: 'http://example.com/schemas/twoFactorAuth.json#',
  type: 'object',
  properties: {
    id_metodo: {
      type: 'integer',
      errorMessage: {
        email: 'El id metodo de autenticación debe ser de tipo entero',
      },
    },
  },
  required: ['id_metodo'],
  errorMessage: {
    required: {
      id_metodo: 'El metodo de autenticación es requerido',
    },
  },

};

export default twoFactorAuthSchema;
