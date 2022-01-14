const perfilCreateSchema = {
  type: 'object',
  properties: {
    nombre: {
      type: 'string',
      errorMessage: {
        type: 'El nombre del perfil debe ser de tipo alfanumerico',
      },
    },
    codigo: {
      type: 'string',
      errorMessage: {
        type: 'El codigo del perfil debe ser de tipo alfanumérico',
      },
    },
  },
  required: ['nombre', 'codigo'],
  errorMessage: {
    required: {
      nombre: 'El nombre es requerido',
      codigo: 'El código es requerido',
    },
  },
};

export default perfilCreateSchema;
