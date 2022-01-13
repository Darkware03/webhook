const recoveryPasswordSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      required: true,
      pattern: '/^(?=.[0-9])(?=.[!@#$%.^&*])[a-zA-Z0-9!@#$%.^&*]{6,16}$/',
    },
    confirmPassword: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: '/^(?=.[0-9])(?=.[!@#$%.^&*])[a-zA-Z0-9!@#$%.^&*]{6,16}$/',
    },
    token: {
      type: 'string',
      required: true,
    },
  },
};

export default recoveryPasswordSchema;
