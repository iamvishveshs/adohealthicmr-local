/**
 * Data repository - load/save full app state (modules, questions)
 */

import { getDatabase } from '../db/init.js';

export async function loadData() {
  const db = getDatabase();
  const modules = await db.allAsync('SELECT id, title, description, color FROM modules ORDER BY id');
  const questionsRows = await db.allAsync('SELECT id, module_id, question, options, correct_answer FROM questions');
  const questionsByModule = {};
  for (const q of questionsRows) {
    const key = String(q.module_id);
    if (!questionsByModule[key]) questionsByModule[key] = [];
    questionsByModule[key].push({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options || '[]'),
      correctAnswer: q.correct_answer,
    });
  }
  return { modules, questions: questionsByModule };
}

export async function saveData(data) {
  const db = getDatabase();
  const modules = Array.isArray(data.modules) ? data.modules : [];
  const questions = data.questions && typeof data.questions === 'object' ? data.questions : {};

  await db.runAsync('DELETE FROM questions');
  await db.runAsync('DELETE FROM modules');

  for (const m of modules) {
    await db.runAsync(
      'INSERT INTO modules (id, title, description, color) VALUES (?, ?, ?, ?)',
      [m.id, m.title || '', m.description || '', m.color || 'blue']
    );
  }

  for (const [moduleIdStr, list] of Object.entries(questions)) {
    if (!Array.isArray(list)) continue;
    const moduleId = parseInt(moduleIdStr, 10);
    for (const q of list) {
      await db.runAsync(
        'INSERT INTO questions (id, module_id, question, options, correct_answer) VALUES (?, ?, ?, ?, ?)',
        [q.id, moduleId, q.question || '', JSON.stringify(q.options || []), q.correctAnswer ?? null]
      );
    }
  }

  return { success: true };
}
