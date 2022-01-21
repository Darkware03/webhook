const usuarioPasswordUpdate = {
  type: 'object',
  properties: {
    password_actual: {
      type: 'string',
      errorMessage: {
        type: 'La contraseña actual debe de ser de tipo alfanumerico',
      },
    },
    password: {
      type: 'string',
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9!@_#\$%\^&\*]{8,20}$',
      errorMessage: {
        type: 'La nueva contraseña debe de ser de tipo alfanumerico',
        pattern: 'La contraseña debe ser de 8 a 20 caracteres y contener, como minimo, una letra mayuscula, una minuscula y un numero',
      },
    },
    confirm_password: {
      type: 'string',
    },
  },
  required: ['password_actual', 'password', 'confirm_password'],
  errorMessage: {
    required: {
      password_actual: 'La contraseña actual es requerida',
      password: 'Debe proporcionar una nueva contraseña',
      confirm_password: 'Debe confirmar la contraseña',
    },
  },
};

export default usuarioPasswordUpdate;
