import mongoose from 'mongoose';
import debug from 'debug';
import * as dotenv from 'dotenv';
dotenv.config();

const log: debug.IDebugger = debug('app:mongoose-service');

class MongooseService {
  private count = 0;
  private mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    useFindAndModify: false,
  }

  constructor() {
    this.connectWithRetry();
  }

  getMongoose() {
    return mongoose;
  }

  connectWithRetry() {
    log('MongoDB connection with retry');

    if(!process.env.DATABASE_URL) {
      log('MongoDB connection failed: DATABASE_URL is not defined');
      return
    }

    mongoose
      .connect(process.env.DATABASE_URL, this.mongooseOptions)
      .then(() => {
        log('MongoDB is connected');
      })
      .catch((err) => {
        log('MongoDB connection unsuccessful, retry after 5 seconds. ', ++this.count);
        setTimeout(this.connectWithRetry, 5000);
      });
  }
}

export default new MongooseService();