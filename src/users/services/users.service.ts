import { CRUD } from "@/common/crud.interface";
import UsersDao from "@/users/dao/users.dao";
import { PatchUserDto } from "../dto/patch.user.dto";
import { PutUserDto } from "../dto/put.user.dto";

class UsersService implements CRUD {
  async create(resource: any) {
    return UsersDao.addUser(resource);
  }

  async deleteById(id: string) {
    return UsersDao.removeUserById(id);
  } 

  async list(limit: number, page: number) {
    // pagination logic here
    return UsersDao.getUsers(limit, page);
  }

  async patchById(id: string, resource: PatchUserDto) {
    return UsersDao.updateUserById(id, resource);
  }

  async readById(id: string) {
    return UsersDao.getUserById(id);
  }

  async putById(id: string, resource: PutUserDto) {
    return UsersDao.updateUserById(id, resource);
  }

  async getUserByEmail(email: string) {
    return UsersDao.getUserByEmail(email);
  }
}

export default new UsersService();