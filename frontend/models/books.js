const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    titulo: String,
    autor: String,
    fechaPublicacion: Date,
    noPaginas: Number,
    genero: String,
    sinopsis: Text
})


module.exports = mongoose.model('book', bookSchema)