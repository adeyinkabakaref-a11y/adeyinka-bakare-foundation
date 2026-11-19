import { after, NextRequest, NextResponse } from "next/server";

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

 after(async () => {
 try {
 const result = await runWeeklyDigest();
 console.info("weekly digest background run finished", result);
 } catch (error) {
 console.error("weekly digest background run failed", error);
 }
 });

 return NextResponse.json(
 {
 success: true,
 status: "accepted",
 message: "Weekly digest is running in the background.",
 },
 { status: 202 },
 );
}

export async function GET(request: NextRequest) {
 return handle(request);
}

export async function POST(request: NextRequest) {
 return handle(request);
}
