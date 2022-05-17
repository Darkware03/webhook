const AddPerfilRolesSchema = {
  $id: 'http://example.com/schemas/AddPerfilRolesSchema.json#',
  type: 'object',
  properties: {
    roles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
  },
  required: ['roles'],
  errorMessage: {
    required: {
      roles: 'El campo rol es obligatorio',
    },
    properties: {
      roles: 'Los roles deben ser de tipo numerico',
    },
  },
};

export default AddPerfilRolesSchema;
