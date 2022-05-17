const rolesDeleteSchema = {
  $id: 'http://example.com/schemas/rolesDeleteSchema.json#',
  type: 'object',
  properties: {
    roles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
  },
  required: ['roles'],
  errorMessage: {
    required: {
      roles: 'El campo roles es requerido',
    },
    properties: {
      roles: 'El campo rol debe de ser un array de valores unicos y tipo numerico',
    },
  },
};

export default rolesDeleteSchema;
