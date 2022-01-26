const perfilCreateSchema = {
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
    roles: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'integer',
      },
      errorMessage: {
        type: 'El id del rol debe ser de tipo entero',
        uniqueItems: 'Los id propocionados deben ser unicos',
      },
    },
  },

};

export default perfilCreateSchema;
