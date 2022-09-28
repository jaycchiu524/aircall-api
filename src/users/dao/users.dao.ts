import { CreateUserDto } from "../dto/create.user.dto";
import { PatchUserDto } from "../dto/patch.user.dto";
import { PutUserDto } from "../dto/put.user.dto";
import mongooseService from "@/common/services/mongoose.service";

import shortid from 'shortid';
import debug from "debug";

const log: debug.IDebugger = debug('app: in-memory-dao')

class UsersDao {
  Schema = mongooseService.getMongoose().Schema;

  userSchema = new this.Schema({
    _id: String,
    email: String,
    // select: false means that the password field will not be returned by default
    password: {type: String, select: false},
    firstName: String,
    lastName: String,
    permissionFlags: Number
  }, {id: false});

  User = mongooseService.getMongoose().model('Users', this.userSchema);
}

export default new UsersDao()