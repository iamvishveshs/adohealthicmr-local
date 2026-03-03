import { getDatabase } from '../db/init.js';

export async function findAll() {
  const db = getDatabase();
  const rows = await db.allAsync('SELECT id, title, description, color FROM modules ORDER BY id');
  return rows;
}

export async function findById(id) {
  const db = getDatabase();
  const row = await db.getAsync('SELECT id, title, description, color FROM modules WHERE id = ?', [id]);
  return row || null;
}

export async function create(data) {
  const db = getDatabase();
  const { id, title, description, color } = data;
  await db.runAsync('INSERT INTO modules (id, title, description, color) VALUES (?, ?, ?, ?)', [
    id, title || '', description || '', color || 'blue',
  ]);
  return findById(id);
}

export async function update(id, data) {
  const db = getDatabase();
  const existing = await findById(id);
  if (!existing) return null;
  const title = data.title ?? existing.title;
  const description = data.description ?? existing.description;
  const color = data.color ?? existing.color;
  await db.runAsync('UPDATE modules SET title = ?, description = ?, color = ? WHERE id = ?', [
    title, description, color, id,
  ]);
  return findById(id);
}

export async function remove(id) {
  const db = getDatabase();
  const result = await db.runAsync('DELETE FROM modules WHERE id = ?', [id]);
  return result.changes > 0;
}
