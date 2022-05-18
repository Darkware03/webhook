const definitionSchema = {
  $id: 'http://example.com/schemas/defs.json#',
  definitions: {
    integer: { type: 'integer' },
    intPositivo: {
      type: 'integer',
      minimun: 1,
    },
    intOrNull: {
      type: ['null', 'integer'],
    },
    double: {
      type: 'number',
    },
    string: { type: 'string' },
    stringOrNull: {
      type: ['null', 'string'],
    },
    date: {
      type: 'string',
      format: 'date',
      errorMessage: {
        format: 'El formato de la fecha es YYYY-MM-DD',
      },
    },
    fechaMenorActual: {
      type: 'string',
      format: 'date',
      isAfter: Date.now(),
      errorMessage: {
        format: 'El formato de la fecha es YYYY-MM-DD',
        properties: { isAfter: 'La fecha debe ser mayor a la actual' },
      },
    },
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
      // eslint-disable-next-line no-useless-escape
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@#$!%*?&\-_.:])([A-Za-z\d$@$!%*?&]|[^ \d]){8,20}$',
      errorMessage: {
        pattern: 'La contraseña debe tener entre 8 y 16 caracteres, al menos un dígito, al menos una minúscula, al menos una mayúscula y al menos un caracter no alfanumérico.',
      },
    },
    decimal: {
      type: 'string',
      // eslint-disable-next-line no-useless-escape
      pattern: '^[0-9]+([.][0-9]+)?$',
      errorMessage: {
        type: 'Debe ser decimal',
        pattern: 'EL campo debe ser un entero o decimal.',
      },
    },
    arrayIntUnico: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'integer',
      },
      errorMessage: {
        uniqueItems: 'No puede existir paramatros identicos en el array',
      },
    },
    arrayInt: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'integer',
      },
    },
    arrayString: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
      },
    },
    codigo: {
      type: ['null', 'string'],
      maxLength: 5,
      errorMessage: {
        type: 'El codigo del perfil debe ser de tipo alfanumérico',
        maxLength: 'El codigo debe ser maximo 5 caracteres',
      },
    },
  },

};

export default definitionSchema;
