import { promisify } from 'util';
import { getDb } from '../config/database.js';
import { initSchema } from './schema.js';

let db = null;

export async function initializeDb() {
  if (db) return db;
  db = getDb();
  db.runAsync = promisify(db.run.bind(db));
  db.getAsync = promisify(db.get.bind(db));
  db.allAsync = promisify(db.all.bind(db));
  await initSchema(db);
  return db;
}

export function getDatabase() {
  if (!db) throw new Error('Database not initialized. Call initializeDb() first.');
  return db;
}
