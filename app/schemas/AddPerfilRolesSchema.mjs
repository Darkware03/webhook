const AddPerfilRolesSchema = {
  type: 'object',
  properties: {
    rol: {
      type: 'integer',
      errorMessage: {
        type: 'El rol debe de ser de tipo entero',
      },
    },
  },
  required: ['rol'],
  errorMessage: {
    required: {
      rol: 'El campo rol es obligatorio',
    },
  },
};

export default AddPerfilRolesSchema;
