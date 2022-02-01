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
      maxLength: 5,
      errorMessage: {
        type: 'El codigo del perfil debe ser de tipo alfanumérico',
        maxLength: 'El codigo debe ser maximo 5 caracteres',
      },
    },
    roles: {
      type: 'array',
      uniqueItems: true,
      minItems: 1,
      errorMessage: {
        type: 'Los roles del perfil debe ser un arreglo de enteros',
        minItems: 'Debe de asignarle por lo menos un rol',
        uniqueItems: 'Los id propocionados deben ser unicos',
      },
    },
  },
  required: ['nombre', 'codigo', 'roles'],
  errorMessage: {
    required: {
      nombre: 'El nombre es requerido',
      codigo: 'El código es requerido',
      roles: 'El campo roles es requerido',
    },
  },
};

export default perfilCreateSchema;
