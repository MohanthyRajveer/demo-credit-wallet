import knex, { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];

let db: Knex;

export const getDb = (): Knex => {
  if (!db) {
    db = knex(config);
  }
  return db;
};

export const destroyDb = async (): Promise<void> => {
  if (db) {
    await db.destroy();
  }
};

export default getDb;