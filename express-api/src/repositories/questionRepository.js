import { getDatabase } from '../db/init.js';

export async function findAll(moduleId) {
  const db = getDatabase();
  let sql = 'SELECT id, module_id, question, options, correct_answer FROM questions';
  const params = [];
  if (moduleId != null) {
    sql += ' WHERE module_id = ?';
    params.push(moduleId);
  }
  sql += ' ORDER BY module_id, id';
  const rows = await db.allAsync(sql, params);
  return rows.map((r) => ({
    id: r.id,
    moduleId: r.module_id,
    question: r.question,
    options: JSON.parse(r.options || '[]'),
    correctAnswer: r.correct_answer,
  }));
}

export async function findById(id, moduleId) {
  const db = getDatabase();
  const row = await db.getAsync('SELECT id, module_id, question, options, correct_answer FROM questions WHERE id = ? AND module_id = ?', [
    id, moduleId,
  ]);
  if (!row) return null;
  return {
    id: row.id,
    moduleId: row.module_id,
    question: row.question,
    options: JSON.parse(row.options || '[]'),
    correctAnswer: row.correct_answer,
  };
}

export async function create(data) {
  const db = getDatabase();
  const { id, moduleId, question, options, correctAnswer } = data;
  await db.runAsync(
    'INSERT INTO questions (id, module_id, question, options, correct_answer) VALUES (?, ?, ?, ?, ?)',
    [id, moduleId, question || '', JSON.stringify(options || []), correctAnswer ?? null]
  );
  return findById(id, moduleId);
}

export async function update(id, moduleId, data) {
  const db = getDatabase();
  const existing = await findById(id, moduleId);
  if (!existing) return null;
  const question = data.question ?? existing.question;
  const options = data.options ?? existing.options;
  const correctAnswer = data.correctAnswer !== undefined ? data.correctAnswer : existing.correctAnswer;
  await db.runAsync(
    'UPDATE questions SET question = ?, options = ?, correct_answer = ? WHERE id = ? AND module_id = ?',
    [question, JSON.stringify(options), correctAnswer, id, moduleId]
  );
  return findById(id, moduleId);
}

export async function remove(id, moduleId) {
  const db = getDatabase();
  const result = await db.runAsync('DELETE FROM questions WHERE id = ? AND module_id = ?', [id, moduleId]);
  return result.changes > 0;
}
