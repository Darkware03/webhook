const perfilesDeleteSchema = {

  $id: 'http://example.com/schemas/perfilesDeleteSchema.json#',
  type: 'object',
  properties: {
    perfiles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
  },
  required: ['perfiles'],
  errorMessage: {
    required: {
      roles: 'El campo perfiles es requerido',
    },
    properties: {
      perfiles: 'Los perfiles deber ser un array numerico',
    },
  },
};

export default perfilesDeleteSchema;
