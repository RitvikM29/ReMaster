const express = require("express");
const { pool } = require("../db");
const { generateInsights } = require("../utils/insights");
const router = express.Router();

router.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM sessions ORDER BY started_at DESC");
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

  const daily = new Map();
  const subjectSplit = new Map();
  const focusScores = [];

  sessions.forEach((session) => {
    const dateKey = new Date(session.startedAt).toISOString().slice(0, 10);
    daily.set(dateKey, (daily.get(dateKey) ?? 0) + session.durationSeconds);

    const label = session.label || "General";
    subjectSplit.set(label, (subjectSplit.get(label) ?? 0) + session.durationSeconds);

    if (Number.isFinite(session.focusScore)) focusScores.push(session.focusScore);
  });

  const analytics = {
    daily: Array.from(daily.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-7),
    subjectSplit: Array.from(subjectSplit.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
    focusScores,
    insights: generateInsights(sessions)
  };

  res.json(analytics);
});

module.exports = router;
