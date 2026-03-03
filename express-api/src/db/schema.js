/**
 * Database schema definitions and initialization
 */

export const SCHEMA = `
-- Items table (example resource for CRUD)
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);

-- App data: modules
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- App data: questions (options and correctAnswer stored as JSON)
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER NOT NULL,
  module_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  correct_answer INTEGER,
  PRIMARY KEY (id, module_id),
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- App data: answers
CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  module_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answer TEXT NOT NULL,
  is_correct INTEGER DEFAULT 0,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_user ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_module ON answers(module_id);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- App data: videos
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  video_type TEXT NOT NULL,
  video_id INTEGER NOT NULL,
  preview TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  file_url TEXT,
  uploaded_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(module_id, video_type, video_id)
);
`;

export async function initSchema(db) {
  return new Promise((resolve, reject) => {
    db.exec(SCHEMA, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
