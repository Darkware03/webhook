const usuarioDestroyUserPerfilSchema = {
  $id: 'http://example.com/schemas/usuarioDestroyUserPerfilSchema.json#',
  type: 'object',
  properties: {
    perfiles: {
      $ref: 'defs.json#/definitions/arrayIntUnico',
    },
  },
  required: ['perfiles'],
  errorMessage: {
    required: {
      perfiles: 'El id del perfil es requerido',
    },
    properties: {
      perfiles: 'El campo perfiles debe de ser un array de valores unicos y tipo numerico',
    },
  },
};

export default usuarioDestroyUserPerfilSchema;
