const usuarioCreateSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    perfiles: {
      required: false,
      type: 'array',
      uniqueItems: true,
      minItems: 1,
      items: {
        type: 'integer',
      },

    },
    roles: {
      required: false,
      type: 'array',
      uniqueItems: true,
      minItems: 1,
      items: {
        type: 'integer',
        unique: true,
      },
    },
  },
  anyOf: [
    {
      required: ['roles'],
    },
    {
      required: ['perfiles'],
    },
  ],

};

export default usuarioCreateSchema;
