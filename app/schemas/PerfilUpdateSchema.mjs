const perfilUpdateSchema = {
  type: 'object',
  properties: {
    nombre: {
      type: 'string',
      errorMessage: {
        type: 'El nombre del perfil debe ser de tipo alfanumerico',
      },
    },
    codigo: {
      type: 'string',
      maxLength: 5,
      errorMessage: {
        type: 'El codigo del perfil debe ser de tipo alfanumérico',
        maxLength: 'El codigo debe ser maximo 5 caracteres',
      },
    },
  },

};

export default perfilUpdateSchema;
