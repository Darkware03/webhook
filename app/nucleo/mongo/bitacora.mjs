import mongoose from 'mongoose';
import mongooseDb from './connection.mjs';

const { Schema } = mongoose;

const bitacoraSchema = new Schema({
  id_usuario: Number, // Number is shorthand for {type: Number}
  fecha_hora_reg: { type: Date, default: Date.now }, // Date, is shorthand for {type: Date}
  ip_cliente: String,
  ip_servidor: String,
  metodo_http: String,
  request_headers: Object,
  request_uri: String,
  request_parameters: Object,
  request_content: Object,
  xrd_userid: String,
  xrd_messageid: String,
  xrd_cliente: String,
  xrd_service: String,
});
mongooseDb.connection();
const Bitacora = mongoose.model('bitacora', bitacoraSchema, 'bitacoras');
export default Bitacora;
