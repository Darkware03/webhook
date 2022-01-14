import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import AjvErrors from 'ajv-errors';

const ajv = new Ajv({ allErrors: true });

addFormats(ajv);
AjvErrors(ajv);

export default ajv;
