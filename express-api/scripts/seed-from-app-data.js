/**
 * Seed Express SQLite DB from data/app-data.json (run once to migrate initial data)
 * Usage: node scripts/seed-from-app-data.js
 */

import { initializeDb } from '../src/db/init.js';
import * as dataRepository from '../src/repositories/dataRepository.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDataPath = path.join(__dirname, '../../data/app-data.json');

async function seed() {
  await initializeDb();
  if (!fs.existsSync(appDataPath)) {
    console.log('No data/app-data.json found. Skipping seed.');
    process.exit(0);
  }
  const raw = fs.readFileSync(appDataPath, 'utf8');
  const data = JSON.parse(raw);
  await dataRepository.saveData({
    modules: data.modules || [],
    questions: data.questions || {},
  });
  console.log('Seeded', (data.modules || []).length, 'modules and questions from app-data.json');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
