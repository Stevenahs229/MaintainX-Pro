import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'maintainx.db');

let db: SqlJsDatabase;

export async function initDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'technician' CHECK(role IN ('admin','manager','technician')),
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      location TEXT,
      technical_sheet TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','maintenance','retired')),
      health_score INTEGER DEFAULT 100 CHECK(health_score BETWEEN 0 AND 100),
      last_maintenance TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS faults (
      id TEXT PRIMARY KEY,
      equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','critical')),
      status TEXT DEFAULT 'submitted' CHECK(status IN ('submitted','analysis','inspection','validation','manufacturing','delivery','closed')),
      images TEXT DEFAULT '[]',
      reported_by TEXT REFERENCES users(id),
      assigned_to TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS spare_parts (
      id TEXT PRIMARY KEY,
      fault_id TEXT REFERENCES faults(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      reference TEXT,
      quantity INTEGER DEFAULT 1,
      unit_price REAL DEFAULT 0,
      supplier TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','ordered','received','installed','cancelled')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('fault_created','status_change','part_ordered','part_received','comment','maintenance_due','equipment_added')),
      message TEXT NOT NULL,
      related_id TEXT,
      related_type TEXT,
      user_id TEXT REFERENCES users(id),
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS fault_comments (
      id TEXT PRIMARY KEY,
      fault_id TEXT NOT NULL REFERENCES faults(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDb();
  return db;
}

export function saveDb(): void {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

function queryAll(sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql: string, params: any[] = []): any | undefined {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : undefined;
}

function execute(sql: string, params: any[] = []): void {
  if (params.length > 0) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
  saveDb();
}

export { queryAll, queryOne, execute };
export default { initDb, getDb, saveDb, queryAll, queryOne, execute };
