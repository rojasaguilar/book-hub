const mongoose = require('mongoose')

let url = "mongodb+srv://rarojasag:Anyway_67357@clusterprueba.noldk14.mongodb.net/book-hub?retryWrites=true&w=majority&appName=ClusterPrueba"

const connectDB = async () => {
    try {
        await mongoose.connect(url, {})
    } catch (error) {
        console.error(error)
    }
}

module.exports = connectDB