/**
 * Item repository - data access layer
 */

import { getDatabase } from '../db/init.js';

export async function findAll(filters = {}) {
  const db = getDatabase();
  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];

  if (filters.name) {
    sql += ' AND name LIKE ?';
    params.push(`%${filters.name}%`);
  }
  if (filters.minQuantity != null) {
    sql += ' AND quantity >= ?';
    params.push(filters.minQuantity);
  }

  sql += ' ORDER BY created_at DESC';
  const rows = await db.allAsync(sql, params);
  return rows;
}

export async function findById(id) {
  const db = getDatabase();
  const row = await db.getAsync('SELECT * FROM items WHERE id = ?', [id]);
  return row || null;
}

export async function create(data) {
  const db = getDatabase();
  const { name, description, quantity } = data;
  const result = await db.runAsync(
    'INSERT INTO items (name, description, quantity) VALUES (?, ?, ?)',
    [name, description ?? null, quantity ?? 0]
  );
  return findById(result.lastID);
}

export async function update(id, data) {
  const db = getDatabase();
  const existing = await findById(id);
  if (!existing) return null;

  const name = data.name ?? existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const quantity = data.quantity !== undefined ? data.quantity : existing.quantity;

  await db.runAsync(
    'UPDATE items SET name = ?, description = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description, quantity, id]
  );
  return findById(id);
}

export async function remove(id) {
  const db = getDatabase();
  const result = await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
  return result.changes > 0;
}
