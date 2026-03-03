import sqlite3 from 'sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/app.db');

export function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
      throw err;
    }
    console.log('Connected to SQLite database');
  });
}

export { DB_PATH };
