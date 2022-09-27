import { CommonRouteConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import UsersMiddleware from "./middlewares/users.middlewares";
import express from "express";

export class UserRoutes extends CommonRouteConfig {
  constructor(app: express.Application) {
    super(app, "UserRoutes");
  }

  configureRoutes() {
    this.app
      .route("/users")
      .get(UsersController.listUsers)
      .post(
        UsersMiddleware.validateRequiredUserBodyFields,
        UsersMiddleware.validateSameEmailDoesntExist,
        UsersController.createUser
      );

    // Add userId to request body
    this.app.param(`userId`, UsersMiddleware.extractUserId);

    this.app
      .route("/users/:userId")
      .all(UsersMiddleware.validateUserExists)
      .get(UsersController.getUserById)
      .delete(UsersController.removeUser);

    this.app.put(`/users/:userId`, [
      UsersMiddleware.validateRequiredUserBodyFields,
      UsersMiddleware.validateSameEmailBelongToSameUser,
      UsersController.put,
    ])

    this.app.patch(`/users/:userId`, [
      UsersMiddleware.validatePatchEmail,
      UsersController.patch,
    ])
    return this.app;
  }
}
