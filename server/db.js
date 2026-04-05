const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL in environment");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      mode TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      started_at TIMESTAMP NOT NULL,
      ended_at TIMESTAMP,
      distractions INTEGER DEFAULT 0,
      idle_seconds INTEGER DEFAULT 0,
      focus_score INTEGER DEFAULT 0,
      label TEXT DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Backfill schema for older databases without user_id.
  await pool.query(`
    ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  `);

  // Allow anonymous sessions (no auth) by ensuring user_id is nullable.
  await pool.query(`
    ALTER TABLE sessions
    ALTER COLUMN user_id DROP NOT NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      type TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

let initPromise = null;
function ensureDb() {
  if (!initPromise) {
    initPromise = initDb().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

module.exports = {
  pool,
  initDb,
  ensureDb
};
