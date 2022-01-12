const perfilCreateSchema = {
  type: 'object',
  properties: {
    nombre: {
      type: 'string',
      required: true,
    },
    codigo: {
      type: 'string',
    },
  },
};

export default perfilCreateSchema;
