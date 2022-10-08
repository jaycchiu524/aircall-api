import express from 'express'
import usersService from '@/users/services/users.service'
import * as argon2 from 'argon2'

class AuthMiddleware {
  constructor() {}

  async verifyUserPassword(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = await usersService.getUserByEmailWithPassword(req.body.email); 

    if(user) {
      const passwordHash = user.password;
      if(passwordHash && await argon2.verify(passwordHash, req.body.password)) {
        // Get rid of password
        // JWT is not a good place to store sensitive data, 
        // so we don't want to store the password in the JWT
        req.body = {
          userId: user._id,
          email: user.email,
          permissionFlags: user.permissionFlags
        };
        return next();
      }
    }
    res.status(400).send({errors: ['Invalid email and/or password']});
  }
}

export default new AuthMiddleware();