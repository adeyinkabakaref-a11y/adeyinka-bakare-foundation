"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, Loader2, Mail, Send, ShieldCheck } from "lucide-react";

type TestResult = {
  success: boolean;
  mode: "sent" | "preview";
  week_label: string;
  recipient: string;
  emails_sent?: number;
  emails_failed?: number;
  reason?: string;
  html?: string;
};

export function DigestTestForm() {
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [includeAdminReport, setIncludeAdminReport] = useState(false);
  const [busy, setBusy] = useState<"send" | "preview" | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);

  async function submit(preview: boolean) {
    setError("");
    setResult(null);

    if (!email.trim() || !secret.trim()) {
      setError("Enter both an email address and the access code.");
      return;
    }

    setBusy(preview ? "preview" : "send");
    try {
      const response = await fetch("/api/cron/weekly-digest/test", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-cron-secret": secret,
        },
        body: JSON.stringify({
          email: email.trim(),
          includeAdminReport,
          preview,
        }),
      });
      const payload = (await response.json()) as TestResult & { error?: string };
      if (!response.ok || !payload.success) {
        setError(payload.error || "The test request failed.");
        return;
      }
      setResult(payload);
    } catch {
      setError("Could not reach the test endpoint. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  const fieldClass =
    "w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-maroon-100 bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-maroon-50 text-primary">
            <ShieldCheck aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-bold">Test the weekly digest</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The digest is addressed only to the email below. Your normal member, subscriber and admin lists are not contacted from this page.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <div>
            <label htmlFor="test-email" className="mb-2 block text-sm font-semibold">
              Email address for the test
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="test-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="test-secret" className="mb-2 block text-sm font-semibold">
              Access code
            </label>
            <input
              id="test-secret"
              type="password"
              autoComplete="off"
              placeholder="The CRON_SECRET value"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              className={fieldClass}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              The same secret used by the cron endpoint. It is sent only to this site&apos;s test API and is never stored in the browser.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-maroon-50 p-4 text-sm">
            <input
              type="checkbox"
              checked={includeAdminReport}
              onChange={(event) => setIncludeAdminReport(event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--abf-maroon-500)]"
            />
            <span>
              <span className="font-semibold">Also include the confidential admin report</span>
              <span className="mt-1 block text-muted-foreground">
                Sends the second security and operations email to the same address.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => submit(false)}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-maroon-700 disabled:opacity-60"
            >
              {busy === "send" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
              {busy === "send" ? "Sending…" : "Send test email"}
            </button>
            <button
              type="button"
              onClick={() => submit(true)}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-maroon-200 bg-background px-5 py-3 text-sm font-semibold text-primary transition hover:bg-maroon-50 disabled:opacity-60"
            >
              {busy === "preview" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              {busy === "preview" ? "Rendering…" : "Preview without sending"}
            </button>
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        {result?.mode === "sent" && (
          <div className="flex items-start gap-3 rounded-xl border border-maroon-100 bg-maroon-50 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-semibold text-primary">Test digest sent</p>
              <p className="mt-1 text-muted-foreground">
                {result.emails_sent} email{result.emails_sent === 1 ? "" : "s"} delivered to {result.recipient} for {result.week_label}.
                {result.emails_failed ? ` ${result.emails_failed} failed.` : ""}
              </p>
              {result.reason && <p className="mt-1 text-muted-foreground">{result.reason}</p>}
            </div>
          </div>
        )}

        {result?.mode === "preview" && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-maroon-100 bg-maroon-50 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p className="text-muted-foreground">
                Preview for <strong className="text-foreground">{result.recipient}</strong> · {result.week_label}. Nothing was sent.
              </p>
            </div>
            <iframe
              title="Weekly digest preview"
              srcDoc={result.html}
              className="h-[720px] w-full rounded-2xl border border-maroon-100 bg-white"
              sandbox=""
            />
          </div>
        )}
      </div>
    </div>
  );
}
