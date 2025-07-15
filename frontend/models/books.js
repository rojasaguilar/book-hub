const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  autor: {
    type: String,
    required: true,
  },
  fechaPublicacion: {
    type: Date,
    required: false
  },
  fechaSubido: {
    type: Date,
    default: () => Date.now(),
    immutable: true,
  },
  noPaginas: {
    type: Number,
    required: true,
  },
  capitulos:{
    type: Number,
    required: true,
  },
  categoria: {
    type: String,
    required: false,
  },
  sinopsis: {
    type: String,
    required: false,
  },
  etiquetas: {
    type: [String],
    required: false
  },
  portada: {
    type: String,
    required: true
  },
  libro: {
    type: String,
    required: true
  },
  subidoPor:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  }
});

module.exports = mongoose.model("book", bookSchema);
