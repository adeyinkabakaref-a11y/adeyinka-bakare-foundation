import { NextRequest, NextResponse } from "next/server";

import { isAuthorizedCron } from "@/lib/weekly/cron-auth";
import { runWeeklyDigest } from "@/lib/weekly/weekly-digest.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

async function handle(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
    );
  }

  try {
    const result = await runWeeklyDigest();
    return NextResponse.json(
      {
        success: result.ok,
        skipped: result.skipped,
        reason: result.reason,
        week_key: result.weekKey,
        week_label: result.weekLabel,
        member_recipients: result.memberRecipients,
        admin_recipients: result.adminRecipients,
        emails_sent: result.emailsSent,
        emails_failed: result.emailsFailed,
        skipped_duplicates: result.skippedDuplicates,
      },
      { status: result.ok ? 200 : 502 },
    );
  } catch (error) {
    console.error("weekly digest cron failed", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Weekly digest failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
