const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { initDb, ensureDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure DB is initialized in serverless environments.
ensureDb().catch((error) => {
  console.error("DB init failed", error);
});

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((item) => item.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/sessions", require("./routes/sessions"));
app.use("/analytics", require("./routes/analytics"));

// Vercel serverless paths include the /api prefix, so mount duplicates there too.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/analytics", require("./routes/analytics"));

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

module.exports = { app, start };
