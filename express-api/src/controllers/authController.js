import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function register(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const db = getDatabase();
    const existing = await db.getAsync('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    await db.runAsync('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
    return res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const db = getDatabase();
    const user = await db.getAsync('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
}

