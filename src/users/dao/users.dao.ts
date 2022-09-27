import { CreateUserDto } from "../dto/create.user.dto";
import { PatchUserDto } from "../dto/patch.user.dto";
import { PutUserDto } from "../dto/put.user.dto";

import shortid from 'shortid';
import debug from "debug";

const log: debug.IDebugger = debug('app: in-memory-dao')

class UsersDao {
  users: Array<CreateUserDto> = [];

  constructor() {
    log('Create new instance of UsersDao')
  }

  async addUser(user: CreateUserDto) {
    user.id = shortid.generate()
    this.users.push(user)
    return user.id
  }

  async getUsrs() {
    return this.users
  }

  async getUserById(userId: string) {
    return this.users.find((user: {id: string}) => user.id === userId)
  }

  async getUserByEmail(email: string) {
    const objIndex = this.users.findIndex(
      (obj: {email: string}) => obj.email === email
    )
    let currentUser = this.users[objIndex]
    return currentUser ?? null
  }

   /**
   * putUserById() has a bug. It will let API consumers store values for 
   * fields that are not part of the model defined by our DTO.
   */
  
  async putUserById(userId: string, user: PutUserDto) {
    const objIndex = this.users.findIndex(
      (obj: {id: string}) => obj.id === userId
    )

    this.users.splice(objIndex, 1, user)
    return `${user.id} updated via put`;
  }

  /**
   * depends on a duplicate list of field names that must be kept in sync with the model.
   * Without this, it would have to use the object being updated for this list. 
   * That would mean it would silently ignore values for fields that are part of the DTO-defined model 
   * but hadn’t been saved to before for this particular object instance.
   */

  async patchUserById(userId: string, user: PatchUserDto) {
    const objIndex = this.users.findIndex(
      (obj: {id: string}) => obj.id === userId
    )
    let currentUser = this.users[objIndex]
    const allowedPatchFields = [
      'password', 
      'firstName',
      'lastName',
      'permissionLevel'
    ]

    for (let field of allowedPatchFields) {
      if (field in user) {
        // TODO: @ts-ignore
        // @ts-ignore
        currentUser[field] = user[field]
      }
    }
    this.users.splice(objIndex, 1, currentUser)
    return `${user.id} patched`
  }

  async removeUserById(userId: string) {
    const objIndex = this.users.findIndex(
      (obj: {id: string}) => obj.id === userId
    )
    this.users.splice(objIndex, 1) 
    return `${userId} removed`
  }
}

export default new UsersDao()