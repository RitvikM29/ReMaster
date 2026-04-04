const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { seedUserSessions } = require("../utils/seed");
const { createAuthToken, consumeAuthToken } = require("../utils/authTokens");
const { sendEmail } = require("../utils/mailer");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "User exists" });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3) RETURNING id, email, name",
      [email, hash, name || ""]
    );

    const user = result.rows[0];
    await seedUserSessions(user.id);

    const verifyToken = await createAuthToken(user.id, "verify", 60 * 24);
    const appUrl = process.env.APP_URL || "http://localhost:5173";
    let emailSent = true;
    let warning = null;
    try {
      await sendEmail({
        to: email,
        subject: "Verify your ReMaster account",
        html: `<p>Welcome to ReMaster! Verify your email:</p><p><a href="${appUrl}/?verify=${verifyToken}">Verify account</a></p>`
      });
    } catch (mailError) {
      emailSent = false;
      warning = "Verification email could not be sent. Check RESEND_API_KEY or sandbox restrictions, then resend.";
      console.error("Email send failed", mailError);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.AUTH_SECRET || "remaster_dev_secret", {
      expiresIn: "30d"
    });

    res.json({ token, user, emailSent, warning });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Signup failed",
      detail: process.env.NODE_ENV === "production" ? undefined : error?.message
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.email_verified_at) return res.status(403).json({ error: "Email not verified. Check your inbox or resend." });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.AUTH_SECRET || "remaster_dev_secret", {
      expiresIn: "30d"
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: "Token required" });
    const record = await consumeAuthToken("verify", token);
    if (!record) return res.status(400).json({ error: "Invalid token" });

    await pool.query("UPDATE users SET email_verified_at = NOW() WHERE id = $1", [record.user_id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });
    const result = await pool.query("SELECT id, email_verified_at FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.json({ ok: true });
    if (user.email_verified_at) return res.json({ ok: true });

    const verifyToken = await createAuthToken(user.id, "verify", 60 * 24);
    const appUrl = process.env.APP_URL || "http://localhost:5173";
    await sendEmail({
      to: email,
      subject: "Verify your ReMaster account",
      html: `<p>Verify your email:</p><p><a href="${appUrl}/?verify=${verifyToken}">Verify account</a></p>`
    });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Resend failed" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.json({ ok: true });

    const resetToken = await createAuthToken(user.id, "reset", 60);
    const appUrl = process.env.APP_URL || "http://localhost:5173";
    await sendEmail({
      to: email,
      subject: "Reset your ReMaster password",
      html: `<p>Reset your password:</p><p><a href="${appUrl}/?reset=${resetToken}">Reset password</a></p>`
    });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Reset failed" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: "Token and password required" });
    const record = await consumeAuthToken("reset", token);
    if (!record) return res.status(400).json({ error: "Invalid token" });

    const hash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, record.user_id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Password reset failed" });
  }
});

module.exports = router;
