import ajv from '../utils/ajv-instance.mjs';
import HttpCode from '../../configs/httpCode.mjs';

function validate(schema) {
  const ajvValidate = ajv.compile(schema);
  // eslint-disable-next-line consistent-return
  return (req, res, next) => {
    const valid = ajvValidate(req.body);
    const { errors } = ajvValidate;

    if (!valid) {
      return res.status(HttpCode.HTTP_BAD_REQUEST).json(errors);
    }
    next();
  };
}

export default validate;
