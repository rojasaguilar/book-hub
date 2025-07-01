const mongoose = require('mongoose')

let db = "mongodb://localhost:27017/prueba";

const connectDB = async () =>{
    try {
        await mongoose.connect(db,{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
    } catch (error) {
        console.error(error)
    }
}

module.exports = connectDB;