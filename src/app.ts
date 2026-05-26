import express, { Application } from 'express';
import { Knex } from 'knex';
import { createRouter } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './utils/logger';

export const createApp = (db: Knex): Application => {
  const app = express();

  // Parse incoming JSON requests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Log every incoming request
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // All routes live under /api/v1
  app.use('/api/v1', createRouter(db));

  // Handle unknown routes
  app.use(notFoundHandler);

  // Handle all errors
  app.use(errorHandler);

  return app;
};