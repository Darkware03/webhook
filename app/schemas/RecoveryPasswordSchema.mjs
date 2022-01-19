const recoveryPasswordSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@#$!%*?&\-_.:])([A-Za-z\d$@$!%*?&]|[^ \d]){8,20}',
    },
    confirmPassword: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@#$!%*?&\-_.:])([A-Za-z\d$@$!%*?&]|[^ \d]){8,20}',
    },
  },
};

export default recoveryPasswordSchema;
