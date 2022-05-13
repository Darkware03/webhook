const rolCreateSchema = {
  $id: 'http://example.com/schemas/rolCreateSchema.json#',
  type: 'object',
  properties: {
    idTipoRol: {
      $ref: 'defs.json#/definitions/integer',
    },
    name: {
      $ref: 'defs.json#/definitions/string',
    },
  },
  required: ['idTipoRol', 'name'],
  errorMessage: {
    required: {
      name: 'El campo name es requerido',
    },
    properties: {
      name: 'El campo name debe ser de tipo alfanumérico',
      idTipoRol: 'El campo idTipoRol debe ser de tipo numérico',
    },
  },
};

export default rolCreateSchema;
