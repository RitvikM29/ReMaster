const express = require("express");
const { pool, ensureDb } = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await ensureDb();
    const payload = req.body || {};
    const result = await pool.query(
      `
      INSERT INTO sessions (
        user_id, mode, duration_seconds, started_at, ended_at, distractions, idle_seconds, focus_score, label
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        null,
        payload.mode,
        payload.durationSeconds,
        payload.startedAt,
        payload.endedAt ?? null,
        payload.distractions ?? 0,
        payload.idleSeconds ?? 0,
        payload.focusScore ?? 0,
        payload.label ?? ""
      ]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      mode: row.mode,
      durationSeconds: row.duration_seconds,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      distractions: row.distractions,
      idleSeconds: row.idle_seconds,
      focusScore: row.focus_score,
      label: row.label
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: "Invalid session data",
      detail: process.env.NODE_ENV === "production" ? undefined : error?.message
    });
  }
});

router.get("/", async (_req, res) => {
  await ensureDb();
  const result = await pool.query("SELECT * FROM sessions ORDER BY started_at DESC LIMIT 500");
  const sessions = result.rows.map((row) => ({
    id: row.id,
    mode: row.mode,
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    distractions: row.distractions,
    idleSeconds: row.idle_seconds,
    focusScore: row.focus_score,
    label: row.label
  }));
  res.json(sessions);
});

module.exports = router;
