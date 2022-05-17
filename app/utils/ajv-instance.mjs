import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import AjvErrors from 'ajv-errors';
import { dates } from 'ajv-dates';
import definitionSchema from '../schemas/definitions.mjs';

const ajv = dates(new Ajv({
  allErrors: true,
  $data: true,
}));

addFormats(ajv);
AjvErrors(ajv);
ajv.addSchema(definitionSchema);

export default ajv;
