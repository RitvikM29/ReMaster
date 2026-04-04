const { pool } = require("../db");

async function seedUserSessions(userId) {
  const today = new Date();
  const values = [];
  const placeholders = [];
  let idx = 1;

  for (let i = 27; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const count = Math.floor(Math.random() * 5);
    for (let j = 0; j < count; j += 1) {
      const started = new Date(date);
      started.setHours(9 + j * 2, 0, 0, 0);
      const durationSeconds = 1200 + Math.floor(Math.random() * 1200);
      const ended = new Date(started.getTime() + durationSeconds * 1000);
      placeholders.push(
        `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
      );
      values.push(
        userId,
        "timer",
        durationSeconds,
        started.toISOString(),
        ended.toISOString(),
        Math.floor(Math.random() * 3),
        Math.floor(Math.random() * 120),
        70 + Math.floor(Math.random() * 25)
      );
    }
  }

  if (values.length === 0) return;

  await pool.query(
    `
    INSERT INTO sessions (
      user_id, mode, duration_seconds, started_at, ended_at, distractions, idle_seconds, focus_score
    ) VALUES ${placeholders.join(",")}
    `,
    values
  );
}

module.exports = { seedUserSessions };
