const mongoose = require('mongoose')

// let db = "mongodb://localhost:27017/prueba";

// const connectDB = async () =>{
//     try {
//         await mongoose.connect(db,{
//             useUnifiedTopology: true,
//             useNewUrlParser: true
//         })
//     } catch (error) {
//         console.error(error)
//     }
// }

// module.exports = connectDB;

let url = "mongodb+srv://rarojasag:Anyway_67357@clusterprueba.noldk14.mongodb.net/book-hub?retryWrites=true&w=majority&appName=ClusterPrueba"

const connectDB = async () => {
    try {
        await mongoose.connect(url, {})
    } catch (error) {
        console.error(error)
    }
}

module.exports = connectDB