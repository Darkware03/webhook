const rolesDeleteSchema = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      uniqueItems: true,
      minItems: 1,
      items: {
        type: 'integer',
      },
      errorMessage: {
        type: 'El id del rol debe ser de tipo entero',
        minItems: 'Debe de proporcionar por lo menos un rol',
        uniqueItems: 'Los id propocionados deben ser unicos',
      },
    },
  },
  required: ['roles'],
  errorMessage: {
    required: {
      roles: 'El campo roles es requerido',
    },
  },
};

export default rolesDeleteSchema;
