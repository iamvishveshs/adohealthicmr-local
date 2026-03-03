/**
 * File-based user store when DATABASE_URL is not set.
 * Used for user login/create account without PostgreSQL.
 */

import * as bcrypt from 'bcryptjs';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface FallbackUserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'user';
}

const FALLBACK_FILE = path.join(process.cwd(), 'data', 'users-fallback.json');

async function ensureDataDir(): Promise<void> {
  const dir = path.dirname(FALLBACK_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function readUsers(): Promise<FallbackUserRecord[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(FALLBACK_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: FallbackUserRecord[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function getFallbackUsers(): Promise<Omit<FallbackUserRecord, 'passwordHash'>[]> {
  const users = await readUsers();
  return users.map(({ passwordHash: _, ...u }) => u);
}

export async function getFallbackUserByEmail(email: string): Promise<FallbackUserRecord | undefined> {
  const key = email.trim().toLowerCase();
  const users = await readUsers();
  return users.find((u) => u.email === key);
}

export function verifyFallbackPassword(user: FallbackUserRecord, password: string): boolean {
  return bcrypt.compareSync(password, user.passwordHash);
}

export async function getFallbackUserById(id: string): Promise<FallbackUserRecord | undefined> {
  const users = await readUsers();
  return users.find((u) => u.id === id);
}

export async function createFallbackUser(email: string, password: string): Promise<FallbackUserRecord> {
  const key = email.trim().toLowerCase();
  const users = await readUsers();
  if (users.some((u) => u.email === key)) {
    throw new Error('User already exists');
  }
  const id = 'user-' + key.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'user-' + Date.now();
  const passwordHash = bcrypt.hashSync(password, 10);
  const record: FallbackUserRecord = { id, username: key, email: key, passwordHash, role: 'user' };
  users.push(record);
  await writeUsers(users);
  return record;
}

export async function updateFallbackUser(
  id: string,
  updates: { email?: string; username?: string; password?: string }
): Promise<FallbackUserRecord | null> {
  const users = await readUsers();
  const i = users.findIndex((u) => u.id === id);
  if (i === -1) return null;
  if (updates.email) users[i].email = updates.email.trim().toLowerCase();
  if (updates.username) users[i].username = updates.username.trim();
  if (updates.password) users[i].passwordHash = bcrypt.hashSync(updates.password, 10);
  await writeUsers(users);
  return users[i];
}

export async function deleteFallbackUser(id: string): Promise<boolean> {
  const users = await readUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  await writeUsers(filtered);
  return true;
}
