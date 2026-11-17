/**
 * Standalone SMTP test — sends a plain email to a target address
 * using the credentials in .env.local, without starting the dev server.
 *
 * Usage: npx tsx scripts/test-smtp.ts
 */
import * as nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Minimal .env.local parser (no external dependency)
function loadEnvFile(path: string): Record<string, string> {
  const env: Record<string, string> = {};
  const lines = readFileSync(path, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}

const env = loadEnvFile(join(root, ".env.local"));

const SMTP_HOST = env.SMTP_HOST || "smtp.zoho.com";
const SMTP_PORT = Number(env.SMTP_PORT || 587);
const SMTP_USER = env.SMTP_USER || "";
const SMTP_PASSWORD = env.SMTP_PASSWORD || "";
const SMTP_FROM = env.SMTP_FROM || SMTP_USER;
const SMTP_FROM_NAME = env.SMTP_FROM_NAME || "Adeyinka Bakare Fellowship";

const TEST_TO = "techtune.it.solutions@gmail.com";
const TEST_SUBJECT = "ABF SMTP Delivery Test";

if (!SMTP_USER || !SMTP_PASSWORD) {
  console.error("ERROR: SMTP_USER / SMTP_PASSWORD not set in .env.local");
  process.exit(1);
}

async function main() {
  console.log("── SMTP Test ─────────────────────────────────────");
  console.log(`Host      : ${SMTP_HOST}:${SMTP_PORT}`);
  console.log(`From      : ${SMTP_FROM_NAME} <${SMTP_FROM}>`);
  console.log(`To        : ${TEST_TO}`);
  console.log(`Password  : ${SMTP_PASSWORD.replace(/./g, "•")}`);
  console.log("");

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    requireTLS: SMTP_PORT === 587,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  // Step 1: Verify connection
  console.log("Step 1: Verifying SMTP connection...");
  try {
    const verified = await transporter.verify();
    console.log(`  ✓ Connection OK — ${verified ? "server accepted" : "server responded"}`);
  } catch (e: any) {
    console.error(`  ✗ Connection FAILED: ${e.message}`);
    process.exit(1);
  }

  // Step 2: Send test email
  console.log("Step 2: Sending test email...");
  try {
    const info = await transporter.sendMail({
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
      to: TEST_TO,
      subject: TEST_SUBJECT,
      text: `This is a test email from the ABF SMTP server.

If you received this, email delivery via ${SMTP_HOST} is working correctly.

This test was triggered by scripts/test-smtp.ts on ${new Date().toISOString()}.`,
      html: `<p>This is a <strong>test email</strong> from the ABF SMTP server.</p>
<p>If you received this, email delivery via <code>${SMTP_HOST}</code> is working correctly.</p>
<p><em>Sent at ${new Date().toISOString()} via scripts/test-smtp.ts</em></p>`,
    });
    console.log(`  ✓ Sent! Message ID: ${info.messageId}`);
    console.log("");
    console.log("── Result: SUCCESS ──────────────────────────────");
    console.log(`Check ${TEST_TO} for the test email.`);
  } catch (e: any) {
    console.error(`  ✗ Send FAILED: ${e.message}`);
    console.log("");
    console.log("── Result: FAILED ───────────────────────────────");
    console.log("SMTP delivery did not work. Check credentials and Zoho settings.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
