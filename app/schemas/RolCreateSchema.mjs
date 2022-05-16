const rolCreateSchema = {
  $id: 'http://example.com/schemas/rolCreateSchema.json#',
  type: 'object',
  properties: {
    id_tipo_rol: {
      $ref: 'defs.json#/definitions/integer',
    },
    name: {
      $ref: 'defs.json#/definitions/string',
    },
  },
  required: ['id_tipo_rol', 'name'],
  errorMessage: {
    required: {
      name: 'El campo name es requerido',
    },
    properties: {
      name: 'El campo name debe ser de tipo alfanumérico',
      id_tipo_rol: 'El campo id_tipo_rol debe ser de tipo numérico',
    },
  },
};

export default rolCreateSchema;
