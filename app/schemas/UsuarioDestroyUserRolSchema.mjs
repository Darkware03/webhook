const usuarioDestroyUserRolSchema = {
  $id: 'http://example.com/schemas/usuarioDestroyUserPerfilSchema.json#',
  type: 'object',
  properties: {
    roles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
  },
  required: ['roles'],
  errorMessage: {
    required: {
      roles: 'El id del perfil es requerido',
    },
    properties: {
      roles: 'El campo roles debe de ser un array de valores unicos y tipo numerico',
    },
  },
};

export default usuarioDestroyUserRolSchema;
