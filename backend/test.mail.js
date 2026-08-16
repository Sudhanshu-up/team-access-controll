// Standalone SMTP test — isse chalao aur exact error dekho, bina poore app ko chalaye.
//
// Run: cd backend && node testMail.js
//
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

console.log("Testing SMTP with:");
console.log("  HOST:", process.env.MAIL_HOST);
console.log("  PORT:", process.env.MAIL_PORT);
console.log("  USER:", process.env.MAIL_USER);
console.log("  PASS length:", process.env.MAIL_PASS?.length, "chars");
console.log("");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

try {
  console.log("Verifying connection...");
  await transporter.verify();
  console.log("✅ SMTP connection + auth OK. Sending a test mail now...");

  const info = await transporter.sendMail({
    from: `"Team Access Control" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER, // apne aap ko bhejo test ke liye
    subject: "TAC test email",
    html: "<p>Agar ye mil gaya, matlab SMTP config sahi hai.</p>",
  });

  console.log("✅ Email sent! messageId:", info.messageId);
} catch (error) {
  console.error("❌ FAILED:", error.code || error.name, "-", error.message);
  console.error(error);
}