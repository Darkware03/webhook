const usuarioPerfilCreateSchema = {
  type: 'object',
  properties: {
    id_perfil: {
      type: 'number',
    },
    id_usuario: {
      type: 'number',
    },
  },
};

export default usuarioPerfilCreateSchema;
