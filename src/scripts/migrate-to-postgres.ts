import * as fs from 'fs';
import * as path from 'path';
import { query, getPool, close } from '@/lib/pg-client';

async function ensureTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      color TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options JSONB NOT NULL,
      correct_answer INTEGER,
      PRIMARY KEY(id, module_id),
      FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS answers (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      module_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer TEXT NOT NULL,
      is_correct BOOLEAN,
      submitted_at TIMESTAMP WITH TIME ZONE NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT,
      role TEXT
    );
  `);
}

async function migrate() {
  const dataFile = path.join(process.cwd(), 'data', 'app-data.json');
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Set it to your Postgres connection string and try again.');
    process.exit(1);
  }

  if (!fs.existsSync(dataFile)) {
    console.error('data/app-data.json not found');
    process.exit(1);
  }

  const raw = fs.readFileSync(dataFile, 'utf8');
  const data = JSON.parse(raw);
  const modules = Array.isArray(data.modules) ? data.modules : [];
  const questions = data.questions || {};

  try {
    console.log('Ensuring tables...');
    await ensureTables();

    console.log(`Migrating ${modules.length} modules`);
    for (const m of modules) {
      await query(
        `INSERT INTO modules (id, title, description, color) VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, color = EXCLUDED.color`,
        [m.id, m.title, m.description, m.color]
      );
    }

    let qCount = 0;
    for (const [modId, list] of Object.entries(questions)) {
      for (const q of list as any[]) {
        qCount++;
        await query(
          `INSERT INTO questions (id, module_id, question, options, correct_answer)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (id, module_id) DO UPDATE SET question = EXCLUDED.question, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer`,
          [q.id, parseInt(modId, 10), q.question, JSON.stringify(q.options || []), q.correctAnswer ?? null]
        );
      }
    }

    console.log(`Migrated ${qCount} questions`);
    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await close();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
