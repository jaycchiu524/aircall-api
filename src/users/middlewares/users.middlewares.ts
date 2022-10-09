/**
 * Ensure the presence of user fields such as email and password as required to create or update a user
 * Ensure a given email isn’t in use already
 * Check that we’re not changing the email field after creation (since we’re using that as the primary user-facing ID for simplicity)
 * Validate whether a given user exists
 */

import { Request, Response, NextFunction } from "express";
import usersService from "../services/users.service";

class UsersMiddleware {
  async extractUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    req.body.id = req.params.userId;
    next();
  }

  async validateSameEmailDoesntExist(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = await usersService.getUserByEmail(req.body.email);
    if (user) {
      res.status(400).send({ error: `User email already exists` });
    } else {
      next();
    }
  }

  async validateSameEmailBelongToSameUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (res.locals.user._id === req.params.userId) {
      next();
    } else {
      res.status(400).send({ error: `Invalid email` });
    }
  }

  // This middleware is used to validate that the user is the same as the one in the token
  // Arrow functions are used to avoid binding issues with this
  validatePatchEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if(req.body.email){
      this.validateSameEmailBelongToSameUser(req, res, next);
    } else {
      next();
    }
  }

  async validateUserExists(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = await usersService.readById(req.params.userId);
    if (user) {
      // For checking if the user has the permission to do something
      res.locals.user = user;
      next();
    } else {
      res.status(404).send({ error: `User ${req.params.userId} not found` });
    }
  }

  async userCantChangePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (req.body.permissionFlags) {
      res.status(400).send({ error: `Permission flags can't be changed` });
    } else {
      next();
    }
  }
}

export default new UsersMiddleware();