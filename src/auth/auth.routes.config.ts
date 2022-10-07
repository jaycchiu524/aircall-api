import express from "express";
import { CommonRouteConfig } from "@/common/common.routes.config";
import { body } from "express-validator";
import BodyValidationMiddleware from "@/common/middlewares/body.validation.middleware";
import authMiddleware from "./middlewares/auth.middleware";
import authController from "./controllers/auth.controller";
import jwtMiddleware from "./middlewares/jwt.middleware";

export class AuthRoutes extends CommonRouteConfig {
  constructor(app: express.Application) {
    super(app, "AuthRoutes");
  }

  configureRoutes(): express.Application {
    this.app.post(`/auth`, [
      body("email").isEmail(),
      body("password").isString(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      authMiddleware.verifyUserPassword,
      authController.createJWT
    ])

    this.app.post(`/auth/refresh-token`, [
      jwtMiddleware.validJWTNeeded,
      jwtMiddleware.verifyRefreshBodyField,
      jwtMiddleware.validRefreshNeeded,
      authController.createJWT
    ])

    return this.app;
  }
}