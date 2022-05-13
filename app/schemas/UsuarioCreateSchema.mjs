const usuarioCreateSchema = {
  $id: 'http://example.com/schemas/usuarioCreateSchema.json#',
  type: 'object',
  properties: {
    password: {
      $ref: 'defs.json#/definitions/password',
    },
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
  required: ['password', 'email'],
  errorMessage: {
    required: {
      password: 'El campo de contraseña del usuario es requerido',
      email: 'El campo de email del usuario es requerido',
    },
    properties: {
      perfiles: 'El campo perfiles debe de ser un array de valores unicos y tipo numerico',
      roles: 'El campo roles debe de ser un array de valores unicos y tipo numerico',
    },
  },
};

export default usuarioCreateSchema;
