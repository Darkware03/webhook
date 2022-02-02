const recoveryPasswordSchema = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@#$!%*?&\-_.:])([A-Za-z\d$@$!%*?&]|[^ \d]){8,20}$',
      errorMessage: {
        pattern: 'La contraseña debe tener entre 8 y 16 caracteres, al menos un dígito, al menos una minúscula, al menos una mayúscula y al menos un caracter no alfanumérico.',
      },
    },
    confirmPassword: {
      type: 'string',
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@#$!%*?&\-_.:])([A-Za-z\d$@$!%*?&]|[^ \d]){8,20}$',
      errorMessage: {
        pattern: 'La contraseña debe tener entre 8 y 16 caracteres, al menos un dígito, al menos una minúscula, al menos una mayúscula y al menos un caracter no alfanumérico.',
      },
    },
  },
  required: ['password', 'confirmPassword'],
  errorMessage: {
    required: {
      password: 'El campo password es requerido',
      confirmPassword: 'El campo confirmPassword es requerido',
    },
  },
};

export default recoveryPasswordSchema;
