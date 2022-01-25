const perfilesDeleteSchema = {
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
        minItems: 'Debe de proporcionar por lo menos un perfil',
        uniqueItems: 'Los id propocionados deben ser unicos',
      },
    },
  },
  required: ['perfiles'],
  errorMessage: {
    required: {
      roles: 'El campo perfiles es requerido',
    },
  },
};

export default perfilesDeleteSchema;
