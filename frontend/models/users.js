const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    nombreUsuario: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    /*
    librosSubidos: {
    type: [Book]
    }
    */
});

module.exports =  mongoose.model('users',userSchema)