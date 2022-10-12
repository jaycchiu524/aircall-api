import mongoose from 'mongoose';
import debug from 'debug';
import * as dotenv from 'dotenv';
dotenv.config();

const log: debug.IDebugger = debug('app:mongoose-service');

class MongooseService {
  private count = 0;

  /**
   * useNewUrlParser, useUnifiedTopology, useFindAndModify, and useCreateIndex are no longer supported options. 
   * Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology, and useCreateIndex are true, 
   * and useFindAndModify is false. Please remove these options from your code.
   */

  // private mongooseOptions = {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   serverSelectionTimeoutMS: 5000,
  //   useFindAndModify: false,
  // }

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

    log(process.env.DATABASE_URL)

    mongoose
      .connect(process.env.DATABASE_URL)
      .then(() => {
        log('MongoDB is connected');
      })
      .catch((err) => {
        log(err)
        log('MongoDB connection unsuccessful, retry after 5 seconds. ', ++this.count);
        setTimeout(() => {
          this.connectWithRetry()
        }, 5000);
      });
  }
}

export default new MongooseService();