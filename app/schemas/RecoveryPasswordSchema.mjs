const recoveryPasswordSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&\-_.])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$',
    },
    confirmPassword: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&\-_.])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$',
    },
    token: {
      type: 'string',
      required: true,
    },
  },
};

export default recoveryPasswordSchema;
