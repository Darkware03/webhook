/* eslint-disable linebreak-style */
const usuarioUpdateEmailSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: "^[a-z0-9!#\$%&'\+/=?\^_`{|}~-]+(?:.[a-z0-9!#\$%&'\+/=?\^_`{|}~-]+)@(?:.[a-z0-9](?:[a-z0-9-][a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$",
    },
  },
};

// eslint-disable-next-line indent
  export default usuarioUpdateEmailSchema;
