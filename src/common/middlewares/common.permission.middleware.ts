import express from 'express'
import { PermissionFlag } from './common.permissionflag.enum'
import debug from 'debug'

const log: debug.IDebugger = debug('app:common-permission-middleware')

class CommonPermissionMiddleware {
  permissionFlagRequired = (requiredPermissionFlag: PermissionFlag) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        log('required userPermissionFlags: %o',  parseInt(res.locals.jwt.permissionFlags))
        log('requiredPermissionFlag: %o', requiredPermissionFlag)
        log('userPermissionFlags & requiredPermissionFlag: %o',  parseInt(res.locals.jwt.permissionFlags) & requiredPermissionFlag)
        const userPermissionFlags = parseInt(res.locals.jwt.permissionFlags)
        // @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
        if (userPermissionFlags & requiredPermissionFlag) {
          next()
        } else {
          res.status(403).send()
        }
      } catch (err) {
        log(err)
        res.status(500).send()
      }
    }
  }

  async onlySameUserOrAdminCanDoThisAction(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    log('req.params && req.params.userId && req.params.userId === res.locals.jwt.userId: %o', req.params && req.params.userId && req.params.userId === res.locals.jwt.userId)
    log('res.locals.jwt.userId: %o', res.locals.jwt.userId)
    log('req.params.userId: %o', req.params.userId)
    if (req.params && req.params.userId && req.params.userId === res.locals.jwt.userId) {
      next()
    } else {
      const userPermissionFlags = parseInt(res.locals.jwt.permissionFlags)
      if (userPermissionFlags & PermissionFlag.ADMIN_PERMISSION) {
        next()
      } else {
        res.status(403).send()
      }
    }
  }
}

export default new CommonPermissionMiddleware()