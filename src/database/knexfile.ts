import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config: Record<string, object> = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'demo_credit',
    },
    migrations: {
      directory: path.resolve(__dirname, './migrations'),
      extension: 'ts',
    },
    pool: { min: 2, max: 10 },
  },
};

export default config;
module.exports = config;