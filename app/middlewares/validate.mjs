import ajv from '../utils/ajv-instance.mjs';
import HttpCode from '../../configs/httpCode.mjs';
import Handler from '../../handlers/Handler.mjs';

function validate(schema, type = 'body') {
  const ajvValidate = ajv.compile(schema);
  // eslint-disable-next-line consistent-return
  return (req, res, next) => {
    const valid = ajvValidate(req[type]);

    if (!valid) {
      const { errors } = ajvValidate;
      const aux = {
        message: 'BAD REQUEST',
        statusCode: HttpCode.HTTP_BAD_REQUEST,
        content: errors,
      };
      Handler.logError(req, aux);

      console.log(errors);
      const resultError = errors.map((err) => {
        const respuesta = {};
        respuesta.message = err.message;
        return respuesta;
      });

      return res.status(HttpCode.HTTP_BAD_REQUEST).json(resultError);
    }
    next();
  };
}

export default validate;
