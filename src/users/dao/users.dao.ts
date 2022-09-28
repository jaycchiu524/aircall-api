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

    // disable id virtual getter to avoid confusion
    // @link: https://stackoverflow.com/questions/7034848/mongodb-output-id-instead-of-id
  }, {id: false});

  User = mongooseService.getMongoose().model('Users', this.userSchema);

  constructor() {}

  async addUser(userFields: CreateUserDto) {
    const userId = shortid.generate();
    const user = new this.User({
      _id: userId,
      ...userFields,
      permissionFlags: 1
    });
    await user.save();
    return userId;
  }

  
  /** GET */
  
  // exec() is optional to be used to execute the query but recommended
  async getUserByEmail(email: string) {
    return this.User.findOne({email: email}).exec();
  }

  async getUserById(userId: string) {
    // populate() is used to replace the _id field in the user object with the actual user object
    // @link: https://mongoosejs.com/docs/migrating_to_6.html#strictpopulate
    // return this.User.findOne({_id: userId}).populate('User').exec(); <-- this is wrong by mongoose v6
    return this.User.findOne({_id: userId}).exec();
  }

  async getUsers(limit = 25, page = 0) {
    return this.User.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  /** UPDATE */

  async updateUserById(userId: string, userFields: PatchUserDto | PutUserDto) {
    // new: true means that the updated user object will be returned
    const existingUser = await this.User.findOneAndUpdate({_id: userId}, {$set: userFields}, {new: true}).exec();
    return existingUser;
  }

  /** DELETE */

  async removeUserById(userId: string) {
    return this.User.deleteOne({_id: userId}).exec();
  }
}

export default new UsersDao()

