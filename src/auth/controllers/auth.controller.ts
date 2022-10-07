import express from 'express'
import debug from 'debug'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const log: debug.IDebugger = debug('app:auth-middleware')

/**
* This value is automatically populated from .env, a file which you will have
* to create for yourself at the root of the project.
*
* See .env.example in the repo for the required format.
*/
// @ts-expect-error
const jwtSecret: string = process.env.JWT_SECRET
const tokenExpirationInSeconds = 36000

class AuthController {
  async createJWT(req: express.Request, res: express.Response) {
    try {
      const refreshId = req.body.userId + jwtSecret
      const salt = crypto.createSecretKey(crypto.randomBytes(16))
      const hash = crypto
        .createHmac('sha512', salt)
        .update(refreshId)
        .digest('base64')
      
      req.body.refreshKey = salt.export()

      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds
      })

      return res.status(201).send({
        accessToken: token,
        refreshToken: hash
      })
    } catch (err) {
      log('createJWT error: %o', err)
      return res.status(500).send(err)
    }
  } 
}

export default new AuthController()

/**
 * The jsonwebtoken library will sign a new token with our jwtSecret. 
 * We’ll also generate a salt and a hash using the Node.js-native crypto 
 * module, then use them to create a refreshToken with which API consumers 
 * can refresh the current JWT—a setup that’s particularly good to have 
 * in place for an app to be able to scale.
 * What’s the difference between refreshKey, refreshToken, and accessToken?
 * The *Tokens are sent to our API consumers with the idea being that the 
 * accessToken is used for any request beyond what’s available to the 
 * general public, and refreshToken is used to request a replacement for 
 * an expired accessToken. The refreshKey, on the other hand, is used to 
 * pass the salt variable—encrypted within the refreshToken—back to our 
 * refresh middleware, which we’ll get to below.
 */

// There is a scalability reason, in that the access_token could be verifiable on the resource server without DB lookup or a call out to a central server, then the refresh token serves as the means for revoking in the "an access token good for an hour, with a refresh token good for a year or good-till-revoked."
// There is a security reason, the refresh_token is only ever exchanged with authorization server whereas the access_token is exchanged with resource servers.  This mitigates the risk of a long-lived access_token leaking (query param in a log file on an insecure resource server, beta or poorly coded resource server app, JS SDK client on a non https site that puts the access_token in a cookie, etc) in the "an access token good for an hour, with a refresh token good for a year or good-till-revoked" vs "an access token good-till-revoked without a refresh token."
