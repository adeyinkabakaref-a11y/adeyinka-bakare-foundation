import type { NextRequest } from "next/server";

/**
 * Shared authentication for weekly-digest cron routes.
 * Accepts the secret as a query parameter, Bearer token or custom header.
 */
export function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Fail closed in production. Local development without a secret is allowed.
    return process.env.NODE_ENV !== "production";
  }

  const url = new URL(request.url);
  const header = request.headers.get("authorization");
  const customHeader = request.headers.get("x-cron-secret");
  return (
    header === `Bearer ${secret}` ||
    customHeader === secret ||
    url.searchParams.get("secret") === secret
  );
}
