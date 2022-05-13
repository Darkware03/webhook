const rolCreateSchema = {
  $id: 'http://example.com/schemas/rolCreateSchema.json#',
  type: 'object',
  properties: {
    name: {
      $ref: 'defs.json#/definitions/string',
    },
  },
  required: ['name'],
  errorMessage: {
    required: {
      name: 'El campo name es requerido',
    },
    properties: {
      name: 'El campo name debe ser de tipo alfanumérico',
    },
  },
};

export default rolCreateSchema;
