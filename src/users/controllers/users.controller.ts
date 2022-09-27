import { Request, Response } from "express";
import usersService from "@/users/services/users.service";

import debug from "debug";
import argon2 from "argon2";

const log: debug.IDebugger = debug("app: in-memory-dao");

class UserController {
  async listUsers(req: Request, res: Response) {
    const users = await usersService.list(100, 0);
    res.status(200).send(users);
  }

  async getUserById(req: Request, res: Response) {
    const user = await usersService.readById(req.params.userId);
    res.status(200).send(user);
  }

  async createUser(req: Request, res: Response) {
    req.body.password = await argon2.hash(req.body.password);
    const userId = await usersService.create(req.body);
    res.status(201).send({ id: userId });
  }

  async patch(req: Request, res: Response) {
    if (req.body.password) {
      req.body.password = await argon2.hash(req.body.password);
    }
    const result = await usersService.patchById(req.params.userId, req.body);
    log(result);
    res.status(204).send();
  }

  async put(req: Request, res: Response) {
    req.body.password = await argon2.hash(req.body.password);
    const result = await usersService.putById(req.params.userId, req.body);
    log(result);
    res.status(204).send();
  }

  async removeUser(req: Request, res: Response) {
    const result = await usersService.deleteById(req.params.userId);
    log(result);
    res.status(204).send();
  }
}

export default new UserController();