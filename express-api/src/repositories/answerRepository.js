import { getDatabase } from '../db/init.js';

export async function findAll(userId, moduleId) {
  const db = getDatabase();
  let sql = 'SELECT user_id, module_id, question_id, answer, is_correct, submitted_at FROM answers';
  const params = [];
  const conditions = [];
  if (userId) {
    conditions.push('user_id = ?');
    params.push(userId);
  }
  if (moduleId != null) {
    conditions.push('module_id = ?');
    params.push(moduleId);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY submitted_at DESC';
  const rows = await db.allAsync(sql, params);
  return rows.map((r) => ({
    userId: r.user_id,
    moduleId: r.module_id,
    questionId: r.question_id,
    answer: r.answer,
    isCorrect: !!r.is_correct,
    submittedAt: r.submitted_at,
  }));
}

export async function upsert(data) {
  const db = getDatabase();
  const { userId, moduleId, questionId, answer, isCorrect } = data;
  const existing = await db.getAsync(
    'SELECT id FROM answers WHERE user_id = ? AND module_id = ? AND question_id = ?',
    [userId, moduleId, questionId]
  );
  if (existing) {
    await db.runAsync(
      'UPDATE answers SET answer = ?, is_correct = ? WHERE id = ?',
      [answer, isCorrect ? 1 : 0, existing.id]
    );
  } else {
    await db.runAsync(
      'INSERT INTO answers (user_id, module_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?, ?)',
      [userId, moduleId, questionId, answer, isCorrect ? 1 : 0]
    );
  }
  return { userId, moduleId, questionId, answer, isCorrect, submittedAt: new Date() };
}
