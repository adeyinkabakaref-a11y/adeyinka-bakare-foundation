import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedCron } from "@/lib/weekly/cron-auth";
import { runWeeklyDigest } from "@/lib/weekly/weekly-digest.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_MS = 10 * 60_000;
const MAX_REQUESTS_PER_WINDOW = 6;
const recentRequests = new Map<string, number[]>();

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "local";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recentRequests.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (hits.length >= MAX_REQUESTS_PER_WINDOW) {
    recentRequests.set(key, hits);
    return true;
  }
  hits.push(now);
  recentRequests.set(key, hits);
  if (recentRequests.size > 200) {
    for (const [storedKey, times] of recentRequests) {
      if (!times.some((time) => now - time < RATE_WINDOW_MS)) recentRequests.delete(storedKey);
    }
  }
  return false;
}

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized — enter the correct access code." },
      { status: 401, headers: { ...noStore, "WWW-Authenticate": "Bearer" } },
    );
  }

  if (isRateLimited(clientKey(request))) {
    return NextResponse.json(
      { success: false, error: "Too many test requests. Try again in a few minutes." },
      { status: 429, headers: noStore },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400, headers: noStore },
    );
  }

  const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const includeAdminReport = body.includeAdminReport === true;
  const preview = body.preview === true;

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email address." },
      { status: 400, headers: noStore },
    );
  }

  try {
    const result = await runWeeklyDigest({
      testEmail: email,
      includeAdminReport,
      dryRun: preview,
      returnHtml: preview,
    });

    if (preview) {
      return NextResponse.json(
        {
          success: true,
          test: true,
          mode: "preview",
          week_key: result.weekKey,
          week_label: result.weekLabel,
          recipient: email,
          html: result.memberHtml || "",
          admin_html: includeAdminReport ? result.adminHtml || "" : undefined,
        },
        { headers: noStore },
      );
    }

    return NextResponse.json(
      {
        success: result.ok,
        test: true,
        mode: "sent",
        week_key: result.weekKey,
        week_label: result.weekLabel,
        recipient: email,
        include_admin_report: includeAdminReport,
        emails_sent: result.emailsSent,
        emails_failed: result.emailsFailed,
        reason: result.reason,
      },
      { status: result.ok ? 200 : 502, headers: noStore },
    );
  } catch (error) {
    console.error("weekly digest test failed", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test digest failed",
      },
      { status: 500, headers: noStore },
    );
  }
}
