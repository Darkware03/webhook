const usuarioRolCreateSchema = {
  type: 'object',
  properties: {
    id_usuario: {
      type: 'number',
      required: true,
    },
    id_rol: {
      type: 'number',
      required: true,
    },
  },
};

export default usuarioRolCreateSchema;
