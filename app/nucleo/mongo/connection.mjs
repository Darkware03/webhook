import mongoose from 'mongoose';

export default class connectionMongoose {
// examples database connections mongodb
//   mongoose.createConnection('mongodb://username:password@host:port/database')
//   mongoose.createConnection('mongodb+srv://miguel:123@cluster0.gkgbe.mongodb.net/test')
  static connection() {
    mongoose.connect('mongodb+srv://miguel:123@cluster0.gkgbe.mongodb.net/miguel_db', {
      useNewUrlParser: true,
    })
      .then((db) => console.log(`conectado a base de datos: ${(JSON.stringify(db))}`))
      .catch((err) => console.log(err));
  }
}
