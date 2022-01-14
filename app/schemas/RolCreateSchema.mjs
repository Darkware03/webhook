const rolCreateSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      errorMessage: {
        type: 'El name debe ser de tipo caracteres',
      },
    },
  },
  required: ['name'],
  errorMessage: {
    required: {
      name: 'El campo name es requerido',
    },
  },
};

export default rolCreateSchema;
