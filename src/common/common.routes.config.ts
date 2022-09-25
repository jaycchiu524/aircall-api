import express from 'express'

export abstract class CommonRouteConfig {
  app: express.Application
  name: string

  constructor(app: express.Application, name: string) {
    this.app = app;
    this.name = name;
    this.configureRoutes()
  }

  getName() {
    return this.name
  }

  /**
   * Force any class extending CommonRoutesConfig to provide 
   * an implementation matching that signature — if it doesn’t, 
   * the TypeScript compiler will throw an error.
   */
  abstract configureRoutes(): express.Application
}