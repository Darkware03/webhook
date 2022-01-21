import mongoose from 'mongoose';

// const URI_MONGO_DB = 'mongodb+srv://miguel:123@cluster0.gkgbe.mongodb.net/miguel_db';
const username = process.env.MONGOOSE_USERNAME;
const password = process.env.MONGOOSE_PASSWORD;
const host = process.env.MONGOOSE_HOST;
const port = process.env.MONGOOSE_PORT;
const database = process.env.MONGOSE_DATABASE;

const URI_MONGO_DB = `mongodb://${username}:${password}@${host}:${port}/${database}`;

export default class connectionMongoose {
  static async connection() {
    try {
      await mongoose.connect(URI_MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
