const usuarioPasswordUpdate = {
  type: 'object',
  properties: {
    password_actual: {
      type: 'string',
      required: true,
    },
    password: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9!@_#\$%\^&\*]{8,20}$',
    },
    confirm_password: {
      type: 'string',
      required: true,
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9!@_#\$%\^&\*]{8,20}$',
    },
  },
};

export default usuarioPasswordUpdate;
