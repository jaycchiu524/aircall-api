import express from 'express'
import {validationResult} from 'express-validator'

class BodyValidationMiddleware {
  verifyBodyFieldsErrors(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    res.status(400).send({errors: errors.array()})
  }
}

export default new BodyValidationMiddleware()