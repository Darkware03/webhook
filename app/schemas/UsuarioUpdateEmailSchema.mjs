/* eslint-disable linebreak-style */
const usuarioUpdateEmailSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: "^([a-zA-Z0-9./^S+$/<*>!#\$%&'\+/=?\^_`{|}~-]+([\s]{0}))+?@[a-zA-Z]+([.]{1})[a-zA-Z]+[\s]{0}[.]?[a-zA-Z]{2,}([.]{0})[\s]{0}$",
    },
    password: {
      type: 'string',
      required: true,
    },
  },
};

// eslint-disable-next-line indent
  export default usuarioUpdateEmailSchema;
