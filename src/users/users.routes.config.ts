import { CommonRouteConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import UsersMiddleware from "./middlewares/users.middlewares";
import express from "express";
import { body } from "express-validator";
import BodyValidationMiddleware from "@/common/middlewares/body.validation.middleware";
import jwtMiddleware from "@/auth/middlewares/jwt.middleware";
import permissionMiddleware from "@/common/middlewares/common.permission.middleware";
import { PermissionFlag } from "@/common/middlewares/common.permissionflag.enum";

// Be sure to add BodyValidationMiddleware.verifyBodyFieldsErrors in every route 
// after any body() lines that are present, otherwise none of them will have an effect.

export class UserRoutes extends CommonRouteConfig {
  constructor(app: express.Application) {
    super(app, "UserRoutes");
  }

  configureRoutes() {
    this.app
      .route("/users")
      .get(
        /** Only admin can view all users */
        jwtMiddleware.validJWTNeeded,
        permissionMiddleware.permissionFlagRequired(
          PermissionFlag.ADMIN_PERMISSION
        ),
        UsersController.listUsers
      )
      .post(
        body('email').isEmail(),
        body('password')
          .isLength({ min: 5 })
          .withMessage('Minimum length is 5+ characters'),
        BodyValidationMiddleware.verifyBodyFieldsErrors,
        UsersMiddleware.validateSameEmailDoesntExist,
        UsersController.createUser
      );

    // Add userId to request body
    this.app.param(`userId`, UsersMiddleware.extractUserId);

    this.app
      .route("/users/:userId")
      .all(
        UsersMiddleware.validateUserExists,
        jwtMiddleware.validJWTNeeded,
        permissionMiddleware.onlySameUserOrAdminCanDoThisAction
      )
      .get(UsersController.getUserById)
      .delete(UsersController.removeUser);

    this.app.put(`/users/:userId`, [
      body('email').isEmail(),
      body('password')
        .isLength({ min: 5 })
        .withMessage('Minimum length is 5+ characters'),
      body('firstName').isString(),
      body('lastName').isString(),
      body('permissionFlags').isInt(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      UsersMiddleware.validateSameEmailBelongToSameUser,
      UsersController.put,
    ])

    this.app.patch(`/users/:userId`, [
      body('email').isEmail().optional(),
      body('password')
        .isLength({ min: 5 })
        .withMessage('Minimum length is 5+ characters').optional(),
      body('firstName').isString().optional(),
      body('lastName').isString().optional(),
      body('permissionFlags').isInt().optional(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      UsersMiddleware.validatePatchEmail,
      UsersController.patch,
    ])
    return this.app;
  }
}
