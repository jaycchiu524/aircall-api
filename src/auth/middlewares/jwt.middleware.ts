import usersService from '@/users/services/users.service';
import express, {Request, Response, NextFunction} from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Jwt } from '@/common/types/jwt';
import debug from 'debug';

//@ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET;

const log: debug.IDebugger = debug('jwt-middleware');

class JwtMiddleware {
  verifyRefreshBodyField(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if(req.body && req.body.refreshToken) {
      return next();
    } else {
      return res
        .status(400)
        .send({errors: ['Missing required field: refreshToken']});
    }
  }

  async validRefreshNeeded(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user: any = await usersService.getUserByEmailWithPassword(
      /** From accessToken 
       * "jwt":{
         "email":"jaycchiu524@gmail.com",
         "permissionFlags":1,
         "refreshKey":[
            "Object"
         ],
         "iat":1665120988,
         "exp":1665156988
      }
       */
      res.locals.jwt.email
    )

    const salt = crypto.createSecretKey(
      Buffer.from(res.locals.jwt.refreshKey.data)
    )
    
    /**
     * @link https://nodejs.org/api/crypto.html#hashupdatedata-inputencoding
     */
    const hash = crypto
      .createHmac('sha512', salt)
      .update(res.locals.jwt.userId + jwtSecret)
      .digest('base64')

    // Check if refresh token is valid
    // Reference: auth.controller.ts
    if(hash === req.body.refreshToken) {
      req.body = {
        userId: user.id,
        email: user.email,
        permissionFlags: user.permissionFlags
      }
      return next();
    } else {
      return res.status(400).send({errors: ['Invalid refresh token']});
    }
  }

  validJWTNeeded(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if(req.headers['authorization']) {
      try {
        const authorization = req.headers['authorization'].split(' ');
        // authorization[0] === 'Bearer'
        // authorization[1] === 'token'
        if(authorization[0] !== 'Bearer') {
          return res.status(401).send();
        } else {
          // Verify the token is valid
          /**
           * type Jwt = {
           * refreshKey: string;
           * userId: string;
           * permissionFlags: number;
           * email: string;
           */
          res.locals.jwt = jwt.verify(
            authorization[1],
            jwtSecret
          ) as Jwt;
          next();
        }
      } catch(err) {
        // 403: Forbidden (The request was valid, but the server is refusing action)
        log(err);
        return res.status(403).send();
      }
    } else {
      // 401: Unauthorized - The request requires user authentication
      return res.status(401).send();
    }
  }
}

export default new JwtMiddleware();