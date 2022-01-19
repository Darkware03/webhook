const usuarioUpdateEmailSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      // eslint-disable-next-line no-useless-escape
      pattern: "^([a-zA-Z0-9./^S+$/<*>!#\$%&'\+/=?\^_`{|}~-]+([\s]{0}))+?@[a-zA-Z]+([.]{1})[a-zA-Z]+[\s]{0}[.]?[a-zA-Z]{2,}([.]{0})[\s]{0}$",
      errorMessage: {
        type: 'El correo electronico debe ser alfanumerico ',
        pattern: 'Tiene que ingresar un correo valido',
      },
    },
    password: {
      type: 'string',
      errorMessage: {
        type: 'La contraseña debe ser alfanumerico ',
      },
    },
  },
  required: ['email', 'password'],
  errorMessage: {
    required: {
      email: 'El campo email de la ruta es requerido',
      password: 'El campo password de la ruta es requerido',
    },
  },
};

export default usuarioUpdateEmailSchema;
