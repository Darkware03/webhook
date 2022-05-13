const usuarioUpdateSchema = {
  $id: 'http://example.com/schemas/usuarioUpdateSchema.json#',
  type: 'object',
  properties: {
    email: {
      $ref: 'defs.json#/definitions/email',
    },
    perfiles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
    roles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
  },
  anyOf: [{ required: ['roles'], errorMessage: { required: 'Debe poseer un rol o un pefil' } }, { required: ['perfiles'], errorMessage: { required: 'Debe poseer un rol o un pefil' } }],
  required: ['email'],
  errorMessage: {
    required: {
      email: 'El campo de email del usuario es requerido',
    },
    properties: {
      perfiles: 'El campo perfiles debe de ser un array de valores unicos y tipo numerico',
      roles: 'El campo roles debe de ser un array de valores unicos y tipo numerico',
    },
  },
};

export default usuarioUpdateSchema;
