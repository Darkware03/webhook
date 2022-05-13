const usuarioAddUserRoleSchema = {
  $id: 'http://example.com/schemas/usuarioAddUserRoleSchema.json#',
  type: 'object',
  properties: {
    roles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
  },
  required: ['roles'],
  errorMessage: {
    required: {
      roles: 'El id de rol es requerido',
    },
    properties: {
      roles: 'El campo roles debe de ser un array de valores unicos y tipo numerico',
    },
  },
};

export default usuarioAddUserRoleSchema;
