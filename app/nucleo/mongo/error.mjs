import mongoose from 'mongoose';
import mongooseDb from './connection.mjs';

const { Schema } = mongoose;

const errorSchema = new Schema({
  id_bitacora: Number,
  codigo: Number,
  mensaje: String,
  trace: String,
  fecha_hora_reg: { type: Date, default: Date.now() },
});

mongooseDb.connection();
const Error = mongoose.model('error', errorSchema, 'errors');

export default Error;
