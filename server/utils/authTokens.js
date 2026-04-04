const { pool } = require("../db");
const { createToken, hashToken } = require("./tokens");

async function createAuthToken(userId, type, ttlMinutes) {
  const token = createToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  await pool.query(
    "INSERT INTO auth_tokens (user_id, token_hash, type, expires_at) VALUES ($1,$2,$3,$4)",
    [userId, tokenHash, type, expiresAt]
  );
  return token;
}

async function consumeAuthToken(type, token) {
  const tokenHash = hashToken(token);
  const result = await pool.query(
    `
    UPDATE auth_tokens
    SET used_at = NOW()
    WHERE token_hash = $1
      AND type = $2
      AND used_at IS NULL
      AND expires_at > NOW()
    RETURNING *
    `,
    [tokenHash, type]
  );
  return result.rows[0];
}

module.exports = { createAuthToken, consumeAuthToken };
