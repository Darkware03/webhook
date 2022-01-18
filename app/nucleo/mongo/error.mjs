const mongoose = require('mongoose');

const { Schema } = mongoose;

const errorSchema = new Schema({
  id_bitacora: Number,
  codigo: Number,
  mensaje: String,
  trace: String,
  fecha_hora_reg: { type: Date, default: Date.now() },
});

export default errorSchema;
