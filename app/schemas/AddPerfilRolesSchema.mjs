const AddPerfilRolesSchema = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      uniqueItems: true,
      minItems: 1,
      items: {
        type: 'integer',
      },
      errorMessage: {
        type: 'El id del rol debe ser de tipo entero',
      },
    },
  },
  required: ['roles'],
  errorMessage: {
    required: {
      roles: 'El campo rol es obligatorio',
    },
  },
};

export default AddPerfilRolesSchema;
