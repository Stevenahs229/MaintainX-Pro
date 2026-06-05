import { Router, Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

const router = Router();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return salt + ':' + derivedKey.toString('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return derivedKey.toString('hex') === key;
}

const ADMIN_KEY_HASH = '7749e3d1f1bc51983cbbac01bddb485f42d3b44e4b74f5724ec3c9bb9a8ae1b5';

router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, role, admin_key } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const targetRole = role === 'admin' ? 'admin' : 'technician';

  if (targetRole === 'admin') {
    const keyHash = crypto.createHash('sha256').update(admin_key || '').digest('hex');
    if (keyHash !== ADMIN_KEY_HASH) {
      return res.status(403).json({ error: 'Invalid admin registration key' });
    }
  }

  const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const id = uuid();
  const password_hash = hashPassword(password);
  execute('INSERT INTO users (id, name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)',
    [id, name, email, targetRole, password_hash]);

  const token = uuid();
  execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', [token, id]);

  const user = queryOne('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?', [id]);
  res.status(201).json({ token, user });
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = queryOne('SELECT * FROM users WHERE email = ?', [email]) as any;
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = uuid();
  execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', [token, user.id]);

  const { password_hash, ...safe } = user;
  res.json({ token, user: safe });
});

router.get('/me', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided' });

  const session = queryOne(`
    SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `, [auth]) as any;

  if (!session) return res.status(401).json({ error: 'Invalid token' });
  res.json({ user: session });
});

router.post('/logout', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (auth) execute('DELETE FROM sessions WHERE token = ?', [auth]);
  res.json({ success: true });
});

export default router;
