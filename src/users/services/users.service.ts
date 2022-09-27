import { CRUD } from "@/common/crud.interface";
import UsersDao from "@/users/dao/users.dao";

class UserService implements CRUD {
  async create(resource: any) {
    return UsersDao.addUser(resource);
  }

  async deleteById(id: string) {
    return UsersDao.removeUserById(id);
  } 

  async list(limit: number, page: number) {
    // pagination logic here
    return UsersDao.getUsers();
  }

  async patchById(id: string, resource: any) {
    return UsersDao.patchUserById(id, resource);
  }

  async readById(id: string) {
    return UsersDao.getUserById(id);
  }

  async putById(id: string, resource: any) {
    return UsersDao.putUserById(id, resource);
  }

  async getUserByEmail(email: string) {
    return UsersDao.getUserByEmail(email);
  }
}

export default new UserService();