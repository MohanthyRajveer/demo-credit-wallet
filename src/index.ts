import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import getDb from './database/connection';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

const start = async (): Promise<void> => {
  try {
    const db = getDb();

    // Test database connection
    await db.raw('SELECT 1');
    logger.info('Database connection established');

    // Run migrations automatically on startup
    await db.migrate.latest();
    logger.info('Migrations completed');

    const app = createApp(db);

    app.listen(PORT, () => {
      logger.info(`Demo Credit API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

start();