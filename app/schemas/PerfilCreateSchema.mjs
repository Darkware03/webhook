const perfilCreateSchema = {
  $id: 'http://example.com/schemas/perfilCreateSchema.json#',
  type: 'object',
  properties: {
    nombre: {
      $ref: 'defs.json#/definitions/string',
    },
    codigo: {
      $ref: 'defs.json#/definitions/codigo',
    },
    roles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
  },
  required: ['nombre', 'codigo', 'roles'],
  errorMessage: {
    required: {
      nombre: 'El nombre es requerido',
      codigo: 'El código es requerido',
      roles: 'El campo roles es requerido',
    },
    properties: {
      nombre: 'el nombre debe ser de tipo alfanumerico',
      roles: 'Los roles deber ser un array numerico',
    },
  },
};

export default perfilCreateSchema;
