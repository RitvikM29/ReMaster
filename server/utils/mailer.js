const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || "ReMaster <onboarding@resend.dev>";

let resend = null;
if (apiKey) {
  resend = new Resend(apiKey);
}

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return resend.emails.send({ from, to, subject, html });
}

module.exports = { sendEmail };
