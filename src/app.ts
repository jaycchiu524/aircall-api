import express from 'express'
import * as http from 'http'

import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import cors from 'cors'
import { CommonRouteConfig } from '@/common/common.routes.config'
import { UserRoutes } from '@/users/users.routes.config'
import debug from 'debug'

const app: express.Application = express()
const server: http.Server = http.createServer(app)
const port = 3000;
const routes: Array<CommonRouteConfig> = [];
const debugLog: debug.IDebugger = debug('app')


// Add middleware to parse all incoming requests as JSON
app.use(express.json())

// Add middleware to allow cors
app.use(cors())

// Prepare the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handle by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({all: true})
  )
}

if (!process.env.DEBUG) {
  loggerOptions.meta = false; // when not debugging, log requests as one-liners
}

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions))

// Add the UserRoutes to our array,
// after sending the Express.js application object to have the routes added to our app
routes.push(new UserRoutes(app))

// route to ake sure everything is working properly
const runningMessage = `Server running at http://localhost:${port}`
app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send(runningMessage)
})

server.listen(port, () => {
  routes.forEach((route: CommonRouteConfig) => {
    debugLog(`Routes configured for ${route.getName()}`)
  })
  // our only exception to avoiding console.log(), because we
  // always want to know when the server is done starting up
  console.log(runningMessage)
})