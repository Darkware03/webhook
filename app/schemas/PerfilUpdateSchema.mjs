const perfilUpdateSchema = {
  $id: 'http://example.com/schemas/perfilUpdateSchema.json#',
  type: 'object',
  properties: {
    nombre: {
      $ref: 'defs.json#/definitions/string',
    },
    codigo: {
      $ref: 'defs.json#/definitions/codigo',
    },
  },
  required: ['nombre', 'codigo'],
  errorMessage: {
    required: {
      nombre: 'El campo nombre es requerido',
      codigo: 'El campo codigo es requerido',
    },
    properties: {
      nombre: 'el nombre debe ser de tipo alfanumerico',
    },
  },

};

export default perfilUpdateSchema;
