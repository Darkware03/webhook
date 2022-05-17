const rolCreateSchema = {
  $id: 'http://example.com/schemas/rolCreateSchema.json#',
  type: 'object',
  properties: {
    id_tipo_rol: {
      $ref: 'defs.json#/definitions/integer',
    },
  },
  required: ['id_tipo_rol'],
  errorMessage: {
    properties: {
      id_tipo_rol: 'El campo id_tipo_rol debe ser de tipo numérico',
    },
  },
  allOf: [
    {
      if: {
        properties: { id_tipo_rol: { const: 1 } },
      },
      then: {
        properties: {
          name: {
            type: 'string',
            pattern: '^(ROLE_)+[A-Z_]*',
            errorMessage: {
              type: 'el name debe ser de tipo alfanumerico',
              pattern: 'el name debe tener el prefijo ROLE_',
            },
          },
        },
      },
    },
    {
      if: {
        properties: { id_tipo_rol: { const: 2 } },
      },
      then: {
        properties: {
          name: {
            type: 'string',
            pattern: '^(ROLE_ADMIN_)+[A-Z_]*',
            errorMessage: {
              type: 'el name debe ser de tipo alfanumerico',
              pattern: 'el name debe tener el prefijo ROLE_ADMIN_',
            },
          },
        },
      },
    },
    {
      if: {
        properties: { id_tipo_rol: { const: 3 } },
      },
      then: {
        properties: {
          name: {
            type: 'string',
            pattern: '^(ROLE_FRONT_)+[A-Z_]*',
            errorMessage: {
              type: 'el name debe ser de tipo alfanumerico',
              pattern: 'el name debe tener el prefijo ROLE_FRONT_',
            },
          },
        },
      },
    },
  ],
};

export default rolCreateSchema;
