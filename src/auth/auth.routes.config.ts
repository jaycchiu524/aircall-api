import express from "express";
import { CommonRouteConfig } from "@/common/common.routes.config";
import {body} from "express-validator";
import BodyValidationMiddleware from "@/common/middlewares/body.validation.middleware";
import authMiddleware from "./middlewares/auth.middleware";
import authController from "./controllers/auth.controller";

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

    return this.app;
  }
}