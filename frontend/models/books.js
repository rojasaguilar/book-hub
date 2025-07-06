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
    immutable: true,
  },
  noPaginas: {
    type: Number,
    required: true,
  },
  genero: {
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
  }
});

module.exports = mongoose.model("book", bookSchema);
