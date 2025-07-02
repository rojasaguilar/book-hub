const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String
    // email: String,
    // userName: String,
    // password: String,
    // dateBirth: Date,
});

module.exports =  mongoose.model('users',userSchema)