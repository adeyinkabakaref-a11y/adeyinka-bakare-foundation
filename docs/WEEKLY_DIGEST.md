# ABF Weekly Digest Cron

Automated weekly email sent to members, newsletter subscribers and admins.

## Endpoint

```text
GET  https://abfimpact.org/api/cron/weekly-digest?secret=<CRON_SECRET>
POST https://abfimpact.org/api/cron/weekly-digest
```

`GET` is recommended for cronjobs.org. `POST` is also supported and accepts the same authentication.

Authentication accepts any one of:

- `?secret=<CRON_SECRET>`
- `Authorization: Bearer <CRON_SECRET>`
- `x-cron-secret: <CRON_SECRET>`

If `CRON_SECRET` is not set, the endpoint only works outside production.

## Environment

Add to `.env.local` / hosting environment:

```env
CRON_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=           # optional
GEMINI_MODELS=gemini-3.8-flash,gemini-3.6-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-2.5-flash-lite
WEEKLY_DIGEST_DRY_RUN= # set to 1 to test without sending emails
NEXT_PUBLIC_SITE_URL=https://abfimpact.org
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM_NAME=Adeyinka Bakare Fellowship
SMTP_FROM=...
```

Set `WEEKLY_DIGEST_DRY_RUN=1` to exercise the full endpoint and response without sending mail or writing a completed run.

Without `GEMINI_API_KEY`, the digest still works: a built-in editorial generator writes the narrative from verified weekly counts. With the key, Gemini writes the four narrative blocks, trying each free-tier model in `GEMINI_MODELS` in order and falling back to the deterministic generator if none succeed.

## Database

Apply [the migration](../supabase/migrations/20261119_weekly_digest.sql) in Supabase. It creates `weekly_digest_runs` for idempotency. The endpoint also checks `email_logs` for the same `week_key`, so duplicate runs and overlapping recipients are skipped even before the migration is applied.

## Schedule

Recommended cronjobs.org schedule — every Monday at 08:00 UTC:

```text
0 8 * * 1
```

The endpoint always reports the **last completed Monday–Sunday week**, so run time does not affect the reporting window.

## What is sent

1. **Member digest** — one email per unique address across active members, subscribed newsletter users and active admins.
2. **Admin report** — a second, confidential operations/security email to each active admin.

Recipients are deduplicated by lowercase email. An admin who is also a member or newsletter subscriber receives the member digest only once, plus the admin report.

## Response

```json
{
  "success": true,
  "skipped": false,
  "week_key": "2026-11-09",
  "week_label": "Nov 9 – Nov 15, 2026",
  "member_recipients": 128,
  "admin_recipients": 4,
  "emails_sent": 132,
  "emails_failed": 0,
  "skipped_duplicates": 3
}
```

A repeat call for the same week returns `skipped: true` with `reason: "already_sent"`.

## Single-recipient test page

Open `/test-weekly-digest` (for example `http://localhost:3005/test-weekly-digest`). It asks for:

1. the address that should receive the test,
2. the `CRON_SECRET` access code, and
3. whether to include the confidential admin report.

Two actions are available:

- **Send test email** — builds the real digest for the last completed week and sends it only to the address entered. No other member, subscriber or admin is contacted. The run is not claimed and week-level idempotency is not affected; email logs are tagged `weekly_digest_test`.
- **Preview without sending** — renders the same HTML in an iframe without calling SMTP.

The test API is `POST /api/cron/weekly-digest/test` and uses the same authentication as the cron endpoint (`x-cron-secret` header, Bearer token or `?secret=`). It accepts JSON `{ "email": "you@example.com", "includeAdminReport": false, "preview": false }`. Requests are rate-limited to six per ten minutes per client address. The page is marked `noindex`.

The **Send test email** action is deliberately live: it sends to the one address entered even if `WEEKLY_DIGEST_DRY_RUN=1`, because that switch protects the scheduled cron endpoint. Use **Preview without sending** if you only want to inspect the HTML.

After verifying the email in your inbox, enable the production cron on the main endpoint above. Keep `WEEKLY_DIGEST_DRY_RUN` unset (or `0`) for live scheduled sends.
