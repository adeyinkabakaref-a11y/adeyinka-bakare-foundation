import { format, getISOWeek } from "date-fns";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminEmails } from "@/lib/email/admin-notifications";
import { logEmail } from "@/lib/email/log";
import { sendEmail } from "@/lib/email/send";
import { getSettings } from "@/lib/services/settings.service";
import {
  renderAdminWeeklyDigest,
  renderMemberDigest,
  type AdminWeeklyDigestData,
  type DigestLinkItem,
  type WeeklyDigestData,
  type WeeklyNarrative,
} from "@/lib/email/weekly-digest-template";

type Recipient = {
  email: string;
  name: string;
  sources: string[];
};

type ClaimResult = {
  claimed: boolean;
  reason?: "already_sent" | "in_progress" | "unavailable";
  existing?: { status: string; emails_sent: number };
};

type RunResult = {
  ok: boolean;
  weekKey: string;
  weekLabel: string;
  skipped: boolean;
  reason?: string;
  memberRecipients: number;
  adminRecipients: number;
  emailsSent: number;
  emailsFailed: number;
  skippedDuplicates: number;
 memberHtml?: string;
 adminHtml?: string;
};

type DigestOptions = {
 testEmail?: string;
 includeAdminReport?: boolean;
 dryRun?: boolean;
 returnHtml?: boolean;
};

const MS_PER_DAY = 86_400_000;

function weekWindow(now = new Date()) {
  const utcDay = now.getUTCDay();
  const daysSinceMonday = (utcDay + 6) % 7;
  const thisMondayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - daysSinceMonday,
  );
  const end = new Date(thisMondayUtc);
  const start = new Date(thisMondayUtc - 7 * MS_PER_DAY);
  const weekKey = format(start, "yyyy-MM-dd");
  const label = `${format(start, "MMM d")} – ${format(new Date(end.getTime() - MS_PER_DAY), "MMM d, yyyy")}`;
  return { start, end, weekKey, label, issue: `No. ${getISOWeek(start)}` };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string | null | undefined, max = 190): string {
  if (!value) return "";
  const clean = stripHtml(value);
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

async function countRows(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  column: string,
  from: Date,
  to: Date,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte(column, from.toISOString())
    .lt(column, to.toISOString());
  if (error) return 0;
  return count ?? 0;
}

async function countTotal(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

function toItem(row: Record<string, unknown>, siteUrl: string, dateField = "published_at"): DigestLinkItem {
  const dateValue = row[dateField] || row.created_at;
  let dateLabel = "";
  if (typeof dateValue === "string" && !Number.isNaN(new Date(dateValue).getTime())) {
    dateLabel = format(new Date(dateValue), "MMM d");
  }
  return {
    title: String(row.title || "Untitled"),
    excerpt: truncate(typeof row.excerpt === "string" ? row.excerpt : typeof row.description === "string" ? row.description : ""),
    href: `${siteUrl}/news/${String(row.slug || "")}`,
    image: typeof row.image === "string" ? row.image : null,
    meta: dateLabel || undefined,
  };
}

function toEventItem(row: Record<string, unknown>, siteUrl: string): DigestLinkItem {
  const start = typeof row.start_at === "string" ? new Date(row.start_at) : null;
  const dateLabel = start && !Number.isNaN(start.getTime()) ? format(start, "MMM d, h:mm a") : "";
  const location = typeof row.location === "string" && row.location ? row.location : "Location to be announced";
  return {
    title: String(row.title || "Untitled event"),
    excerpt: truncate(typeof row.description === "string" ? row.description : ""),
    href: `${siteUrl}/events/${String(row.slug || "")}`,
    image: typeof row.image === "string" ? row.image : null,
    meta: `${dateLabel}${dateLabel ? " · " : ""}${location}`,
  };
}

function deterministicNarrative(
  label: string,
  counts: { news: number; events: number; members: number; subscribers: number; applications: number },
): WeeklyNarrative {
  const highlight = counts.news
    ? `${counts.news} new ${counts.news === 1 ? "story" : "stories"} landed in the newsroom`
    : "the newsroom stayed quiet on publications";
  return {
    opening: `Welcome to the ABF weekly letter for ${label}. This is your short, honest briefing on what happened across the fellowship — the stories we published, the opportunities opened, the people who joined us, and the small but meaningful progress that is easy to miss in a busy week. ${highlight}, ${counts.events} ${counts.events === 1 ? "event" : "events"} came onto the calendar, ${counts.members} ${counts.members === 1 ? "person joined" : "people joined"} the membership roll, ${counts.subscribers} ${counts.subscribers === 1 ? "new subscriber chose" : "new subscribers chose"} to stay close to our work, and ${counts.applications} ${counts.applications === 1 ? "application was" : "applications were"} submitted. Behind every number is a person who chose to show up.`,
    foodForThought: `Progress rarely announces itself. It looks like a student asking one more question after class, a volunteer answering a message on time, an administrator checking a detail nobody else sees, a writer rewriting a paragraph because the truth deserved better wording. This week, choose one small task that would make the path easier for someone coming after you. Do it carefully. Do not wait for a title, a platform, or permission before you begin. The fellowship grows because ordinary people decide that the next person should not have to struggle alone. Consider this your gentle nudge: the work in front of you is enough to begin with.`,
    studentAdvice: `If you are a student reading this, treat this week as a practical experiment. First, turn one thing you learned into something you can explain to another person in under two minutes — that is how knowledge becomes confidence. Second, open the events page and register for one session that stretches you, not merely one that fits comfortably. Third, keep a simple record of what you attempted, what confused you, and what you will try next; three lines a day is enough. Fourth, ask for feedback before you think you are ready. Mentors and administrators can help far more when they see the work in progress. Finally, protect your energy: consistency is built by people who rest well enough to return tomorrow.`,
    closing: `Thank you for being part of this community. Whether you read, apply, volunteer, mentor, or simply cheer us on, you help carry the mission forward. We will meet again next week with another honest account of what changed and what comes next.`,
  };
}

function extractJson(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first === -1 || last <= first) return null;
  try {
    return JSON.parse(candidate.slice(first, last + 1));
  } catch {
    return null;
  }
}

const DEFAULT_GEMINI_MODELS = [
 "gemini-3.8-flash",
 "gemini-3.6-flash",
 "gemini-3.5-flash-lite",
 "gemini-3.1-flash-lite",
 "gemini-2.5-flash-lite",
];

function configuredGeminiModels(): string[] {
 const override = process.env.GEMINI_MODELS?.split(",")
 .map((model) => model.trim())
 .filter(Boolean);
 return override?.length ? override : DEFAULT_GEMINI_MODELS;
}

function narrativeFromGeminiText(text: string, fallback: WeeklyNarrative): WeeklyNarrative | null {
 const parsed = extractJson(text);
 if (!parsed || typeof parsed !== "object") return null;
 const record = parsed as Record<string, unknown>;
 const keys: Array<keyof WeeklyNarrative> = ["opening", "foodForThought", "studentAdvice", "closing"];
 const result = { ...fallback };
 for (const key of keys) {
 const value = record[key];
 if (typeof value === "string" && value.trim().length > 40) result[key] = value.trim();
 }
 return keys.every((key) => result[key] !== fallback[key]) ? result : null;
}

async function generateNarrative(
 label: string,
 counts: { news: number; events: number; members: number; subscribers: number; applications: number },
 highlights: string[],
): Promise<WeeklyNarrative> {
 const fallback = deterministicNarrative(label, counts);
 const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
 if (!apiKey) return fallback;

 const prompt = `Write the ABF weekly member letter for ${label}. Use ONLY these verified facts:\n${JSON.stringify(
 { ...counts, highlights },
 null,
 2,
 )}\n\nReturn a JSON object with exactly four string keys: "opening" (2-3 paragraphs, 180-260 words), "foodForThought" (a reflective 180-240 word encouragement with a concrete challenge), "studentAdvice" (a practical 180-260 word guide for students with four clear actions), "closing" (60-100 words). Plain text only: no markdown, no HTML, no bullet symbols. Each value must be one string; use \n\n between paragraphs.`;

 for (const model of configuredGeminiModels()) {
 try {
 const response = await fetch(
 `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
 {
 method: "POST",
 headers: { "content-type": "application/json" },
 body: JSON.stringify({
 systemInstruction: {
 parts: [
 {
 text: "You write the weekly letter for the Adeyinka Bakare Fellowship (ABF), a Nigerian student-focused scholarship and mentorship community. Voice: warm, credible, encouraging, specific, professional, never hype. Do not invent facts, names, dates or numbers. Never mention AI, prompts, or internal processes. Return only JSON.",
 },
 ],
 },
 contents: [{ role: "user", parts: [{ text: prompt }] }],
 generationConfig: {
 candidateCount: 1,
 maxOutputTokens: 2600,
 temperature: 0.7,
 responseMimeType: "application/json",
 },
 }),
 signal: AbortSignal.timeout(15_000),
 },
 );

 if (!response.ok) continue;
 const payload = (await response.json()) as {
 candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
 };
 const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
 if (!text) continue;
 const narrative = narrativeFromGeminiText(text, fallback);
 if (narrative) return narrative;
 } catch {
 // Try the next free-tier model; deterministic copy is the final fallback.
 }
 }

 return fallback;
}

function dedupeRecipients(rows: Recipient[]): Recipient[] {
  const map = new Map<string, Recipient>();
  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    if (!email || !email.includes("@")) continue;
    const existing = map.get(email);
    if (!existing) {
      map.set(email, { ...row, email });
      continue;
    }
    const merged = new Set([...existing.sources, ...row.sources]);
    existing.sources = [...merged];
    if (!existing.name || existing.name === "Friend") existing.name = row.name;
  }
  return [...map.values()];
}

async function mapWithLimit<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, Math.max(items.length, 1)) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  });
  await Promise.all(workers);
}

async function claimRun(
  supabase: ReturnType<typeof createAdminClient>,
  window: ReturnType<typeof weekWindow>,
): Promise<ClaimResult> {
  const { data: existing, error: readError } = await supabase
    .from("weekly_digest_runs")
    .select("status, emails_sent, created_at, completed_at")
    .eq("week_key", window.weekKey)
    .maybeSingle();

  if (readError) {
    const code = String(readError.code || "");
    if (code === "42P01" || code === "PGRST205") return { claimed: true, reason: "unavailable" };
    return { claimed: true, reason: "unavailable" };
  }

  if (existing) {
    const status = String(existing.status || "running");
    if (status === "sent") {
      return { claimed: false, reason: "already_sent", existing: { status, emails_sent: Number(existing.emails_sent || 0) } };
    }
    const createdAt = new Date(String(existing.created_at)).getTime();
    const isStale = Number.isFinite(createdAt) && Date.now() - createdAt > 30 * 60_000;
    if (status === "running" && !existing.completed_at && !isStale) {
      return { claimed: false, reason: "in_progress", existing: { status, emails_sent: 0 } };
    }
    await supabase
      .from("weekly_digest_runs")
      .update({
        status: "running",
        error: null,
        emails_sent: 0,
        emails_failed: 0,
        completed_at: null,
        created_at: new Date().toISOString(),
      })
      .eq("week_key", window.weekKey);
    return { claimed: true };
  }

  const { error: insertError } = await supabase.from("weekly_digest_runs").insert({
    week_key: window.weekKey,
    week_start: window.start.toISOString(),
    week_end: window.end.toISOString(),
    status: "running",
    metadata: { issue: window.issue, label: window.label },
  });
  if (insertError) return { claimed: true, reason: "unavailable" };
  return { claimed: true };
}

async function completeRun(
  supabase: ReturnType<typeof createAdminClient>,
  weekKey: string,
  status: "sent" | "failed",
  counts: { memberRecipients: number; adminRecipients: number; emailsSent: number; emailsFailed: number },
  error?: string,
) {
  await supabase
    .from("weekly_digest_runs")
    .update({
      status,
      ...counts,
      error: error || null,
      completed_at: new Date().toISOString(),
    })
    .eq("week_key", weekKey);
}

function buildRecommendations(input: {
  adminCount: number;
  totpEnabled: number;
  passkeyEnabled: number;
  activeSessions: number;
  failedEmails: number;
  pendingVolunteers: number;
  auditEvents: number;
  weekLabel: string;
}): string[] {
  const out: string[] = [];
  if (input.adminCount > input.totpEnabled) {
    out.push(`${input.adminCount - input.totpEnabled} active admin ${input.adminCount - input.totpEnabled === 1 ? "account has" : "accounts have"} not enabled an authenticator app. Ask them to complete TOTP setup from Security.`);
  }
  if (input.adminCount > input.passkeyEnabled) {
    out.push(`Passkey coverage is ${input.passkeyEnabled}/${input.adminCount}. Encourage passwordless sign-in for privileged accounts where device support allows it.`);
  }
  if (input.activeSessions > input.adminCount) {
    out.push(`${input.activeSessions} recorded sessions exceed the ${input.adminCount} active admins. Review active sessions and revoke devices that are no longer in use.`);
  }
  if (input.failedEmails > 0) {
    out.push(`${input.failedEmails} outbound email${input.failedEmails === 1 ? " failed" : "s failed"} in ${input.weekLabel}. Check SMTP credentials, Zoho app password and recipient validity in the email log.`);
  }
  if (input.pendingVolunteers > 0) {
    out.push(`${input.pendingVolunteers} volunteer sign-up${input.pendingVolunteers === 1 ? " is" : "s are"} still marked new. Assign an owner and update each status this week.`);
  }
  if (input.auditEvents === 0) {
    out.push("No admin audit events were recorded in this window. Confirm that admin actions are still being written to audit_logs; a silent audit trail deserves a check.");
  }
  out.push("Spot-check the published news and events pages on mobile, then confirm images, CTA buttons and the share action still behave correctly.");
  return out;
}

export async function runWeeklyDigest(options: DigestOptions = {}): Promise<RunResult> {
  const supabase = createAdminClient();
  const window = weekWindow();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://abfimpact.org").replace(/\/$/, "");
  const dryRun = options.dryRun ?? process.env.WEEKLY_DIGEST_DRY_RUN === "1";

 const testEmail = options.testEmail?.trim().toLowerCase();
 if (options.testEmail && (!testEmail || !testEmail.includes("@"))) {
 throw new Error("A valid test email address is required");
 }
 const testMode = Boolean(testEmail);
 const testRecipient: Recipient | null = testMode
 ? { email: testEmail as string, name: "Digest Test", sources: ["test"] }
 : null;

  const claim: ClaimResult = dryRun || testMode ? { claimed: true } : await claimRun(supabase, window);
  if (!claim.claimed) {
    return {
      ok: true,
      weekKey: window.weekKey,
      weekLabel: window.label,
      skipped: true,
      reason: claim.reason,
      memberRecipients: 0,
      adminRecipients: 0,
      emailsSent: claim.existing?.emails_sent || 0,
      emailsFailed: 0,
      skippedDuplicates: 0,
    };
  }

  const emptyResult = (error?: string): RunResult => ({
    ok: !error,
    weekKey: window.weekKey,
    weekLabel: window.label,
    skipped: false,
    reason: error,
    memberRecipients: 0,
    adminRecipients: 0,
    emailsSent: 0,
    emailsFailed: 0,
    skippedDuplicates: 0,
  });

  let site = { name: "Adeyinka Bakare Fellowship", tagline: "Empowering Futures, Transforming Lives", logo: `${siteUrl}/brand/logo.png`, url: siteUrl };
  try {
    const settings = await getSettings();
    site = {
      name: settings.site_name || site.name,
      tagline: settings.tagline || site.tagline,
      logo: settings.logo || site.logo,
      url: siteUrl,
    };
  } catch {
    // Site settings are optional; keep the branded fallback.
  }

  const [
    newsResult,
    eventsResult,
    upcomingResult,
    membersResult,
    subscribersResult,
    newMembers,
    newSubscribers,
    totalMembers,
    totalSubscribers,
    newVolunteers,
    pendingVolunteers,
    applications,
    formResponses,
    auditRowsResult,
    auditCount,
    adminInvites,
    emailsThisWeek,
    failedEmails,
    notifications,
    mediaUploads,
    contentUpdates,
    adminRowsResult,
    mfaRowsResult,
    sessionsCount,
    adminEmails,
  ] = await Promise.all([
    supabase
      .from("news")
      .select("title,slug,excerpt,image,published_at,created_at")
      .eq("status", "published")
      .gte("published_at", window.start.toISOString())
      .lt("published_at", window.end.toISOString())
      .order("published_at", { ascending: false })
      .limit(6),
    supabase
      .from("events")
      .select("title,slug,description,image,location,start_at")
      .eq("status", "published")
      .gte("start_at", window.start.toISOString())
      .lt("start_at", window.end.toISOString())
      .order("start_at", { ascending: false })
      .limit(6),
    supabase
      .from("events")
      .select("title,slug,description,image,location,start_at")
      .eq("status", "published")
      .gte("start_at", window.end.toISOString())
      .order("start_at", { ascending: true })
      .limit(5),
    supabase.from("members").select("full_name,email").eq("status", "active").not("email", "is", null),
    supabase.from("newsletter_subscribers").select("full_name,email").eq("status", "subscribed"),
    countRows(supabase, "members", "created_at", window.start, window.end),
    countRows(supabase, "newsletter_subscribers", "created_at", window.start, window.end),
    countTotal(supabase, "members"),
    countTotal(supabase, "newsletter_subscribers"),
    countRows(supabase, "volunteers", "created_at", window.start, window.end),
    supabase.from("volunteers").select("*", { count: "exact", head: true }).eq("status", "new").then((r) => r.count ?? 0),
    supabase.from("form_responses").select("*", { count: "exact", head: true }).gte("submitted_at", window.start.toISOString()).lt("submitted_at", window.end.toISOString()).then((r) => r.count ?? 0),
    countRows(supabase, "form_responses", "created_at", window.start, window.end),
    supabase
      .from("audit_logs")
      .select("action,entity,actor_id,created_at")
      .gte("created_at", window.start.toISOString())
      .lt("created_at", window.end.toISOString())
      .order("created_at", { ascending: false })
      .limit(12)
      .then((r) => r.data || []),
    countRows(supabase, "audit_logs", "created_at", window.start, window.end),
    countRows(supabase, "admin_invites", "created_at", window.start, window.end),
    countRows(supabase, "email_logs", "created_at", window.start, window.end),
    supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "failed").gte("created_at", window.start.toISOString()).lt("created_at", window.end.toISOString()).then((r) => r.count ?? 0),
    countRows(supabase, "notifications", "created_at", window.start, window.end),
    countRows(supabase, "media", "created_at", window.start, window.end),
    countRows(supabase, "contents", "updated_at", window.start, window.end),
    supabase.from("profiles").select("id,full_name").in("role", ["super_admin", "admin", "editor"]).eq("status", "active"),
    supabase.from("admin_mfa").select("admin_id,totp_enabled,passkey_enabled,email_otp_enabled,mfa_required"),
    supabase.from("admin_sessions").select("*", { count: "exact", head: true }).gte("last_activity", window.start.toISOString()).then((r) => r.count ?? 0),
    getAdminEmails().catch(() => [] as Array<{ email: string; full_name: string }>),
  ]);

  const fatal = newsResult.error || eventsResult.error || membersResult.error || subscribersResult.error;
  if (fatal) {
    const message = fatal.message || "Failed to read weekly data";
    if (!dryRun)     await completeRun(supabase, window.weekKey, "failed", { memberRecipients: 0, adminRecipients: 0, emailsSent: 0, emailsFailed: 0 }, message);
    return emptyResult(message);
  }

  const newsRows = (newsResult.data || []) as Array<Record<string, unknown>>;
  const eventRows = (eventsResult.data || []) as Array<Record<string, unknown>>;
  const upcomingRows = (upcomingResult.data || []) as Array<Record<string, unknown>>;
  const news = newsRows.map((row) => toItem(row, siteUrl));
  const events = eventRows.map((row) => toEventItem(row, siteUrl));
  const upcoming = upcomingRows.map((row) => toEventItem(row, siteUrl));

  const counts = {
    news: newsRows.length,
    events: eventRows.length,
    members: newMembers,
    subscribers: newSubscribers,
    applications,
  };
  const highlights = [
    ...news.map((n) => `Story: ${n.title}`),
    ...events.map((e) => `Event: ${e.title}`),
    ...upcoming.map((e) => `Upcoming: ${e.title} — ${e.meta || ""}`),
  ];
  const narrative = await generateNarrative(window.label, counts, highlights);

  const digestData: WeeklyDigestData = {
    site,
    weekLabel: window.label,
    weekStart: window.start.toISOString(),
    weekEnd: window.end.toISOString(),
    issue: window.issue,
    news,
    events,
    upcoming,
    narrative,
    stats: {
      newMembers,
      totalMembers,
      newSubscribers,
      totalSubscribers,
      newVolunteers,
      pendingVolunteers,
      applications,
      formResponses,
      newNews: newsRows.length,
      publishedEvents: eventRows.length,
    },
  };

  const profileMap = new Map<string, string>();
  for (const row of (adminRowsResult.data || []) as Array<{ id: string; full_name: string }>) {
    profileMap.set(row.id, row.full_name);
  }
  const profileIds = new Set(profileMap.keys());
  const mfaRows = (mfaRowsResult.data || []) as Array<{
    admin_id: string;
    totp_enabled: boolean;
    passkey_enabled: boolean;
    email_otp_enabled: boolean;
    mfa_required: boolean;
  }>;
  const activeMfa = mfaRows.filter((row) => profileIds.has(row.admin_id));

  const recommendations = buildRecommendations({
    adminCount: profileIds.size,
    totpEnabled: activeMfa.filter((r) => r.totp_enabled).length,
    passkeyEnabled: activeMfa.filter((r) => r.passkey_enabled).length,
    activeSessions: sessionsCount,
    failedEmails,
    pendingVolunteers,
    auditEvents: auditCount,
    weekLabel: window.label,
  });

  const adminData: AdminWeeklyDigestData = {
    ...digestData,
    admin: {
      adminCount: profileIds.size,
      activeSessions: sessionsCount,
      totpEnabled: activeMfa.filter((r) => r.totp_enabled).length,
      passkeyEnabled: activeMfa.filter((r) => r.passkey_enabled).length,
      emailOtpEnabled: activeMfa.filter((r) => r.email_otp_enabled).length,
      mfaRequired: activeMfa.filter((r) => r.mfa_required).length,
      auditEvents: auditCount,
      adminInvites,
      emailsSent: emailsThisWeek,
      failedEmails,
      notifications,
      mediaUploads,
      contentUpdates,
      formSubmissions: formResponses,
    },
    auditRows: auditRowsResult.map((row: Record<string, unknown>) => ({
      action: String(row.action || "update"),
      entity: String(row.entity || "record"),
      actor: profileMap.get(String(row.actor_id || "")) || "System",
      dateLabel: typeof row.created_at === "string" ? format(new Date(row.created_at), "MMM d, h:mm a") : "—",
    })),
    recommendations,
    dashboardUrl: `${siteUrl}/admin`,
  };

  const memberRecipients = testRecipient ? [testRecipient] : dedupeRecipients([
    ...((membersResult.data || []) as Array<{ full_name: string; email: string }>).map((r) => ({
      email: r.email,
      name: r.full_name || "Friend",
      sources: ["member"],
    })),
    ...((subscribersResult.data || []) as Array<{ full_name: string | null; email: string }>).map((r) => ({
      email: r.email,
      name: r.full_name || "Friend",
      sources: ["newsletter"],
    })),
    ...adminEmails.map((r) => ({ email: r.email, name: r.full_name || "Admin", sources: ["admin"] })),
  ]);
  const adminRecipients = testMode
 ? options.includeAdminReport && testRecipient ? [testRecipient] : []
 : dedupeRecipients(
    adminEmails.map((r) => ({ email: r.email, name: r.full_name || "Admin", sources: ["admin"] })),
  );

  const [priorMemberLogs, priorAdminLogs] = testMode
 ? [{ data: [] }, { data: [] }]
 : await Promise.all([
    supabase.from("email_logs").select("to_email").eq("template", "weekly_member_digest").eq("metadata->week_key", window.weekKey),
    supabase.from("email_logs").select("to_email").eq("template", "weekly_admin_report").eq("metadata->week_key", window.weekKey),
  ]);
  const sentMembers = new Set(
    ((priorMemberLogs.data || []) as Array<{ to_email: string }>).map((r) => r.to_email.toLowerCase()),
  );
  const sentAdmins = new Set(
    ((priorAdminLogs.data || []) as Array<{ to_email: string }>).map((r) => r.to_email.toLowerCase()),
  );

  let emailsSent = 0;
  let emailsFailed = 0;
  let skippedDuplicates = 0;
  const metadataBase = { week_key: window.weekKey, issue: window.issue, week_label: window.label };

  async function deliver(
    recipient: Recipient,
    kind: "member" | "admin",
    message: { subject: string; html: string; text: string },
    sentSet: Set<string>,
  ) {
    const email = recipient.email.toLowerCase();
    if (sentSet.has(email)) {
      skippedDuplicates += 1;
      return;
    }
    sentSet.add(email);
    if (dryRun) {
    emailsSent += 1;
    return;
    }
    try {
      const info = await sendEmail({
        to: email,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      emailsSent += 1;
      await logEmail({
        to_email: email,
        to_name: recipient.name,
        subject: message.subject,
        template: testMode ? "weekly_digest_test" : kind === "member" ? "weekly_member_digest" : "weekly_admin_report",
        html_preview: message.html,
        status: "sent",
        provider_id: (info as { messageId?: string })?.messageId,
        metadata: { ...metadataBase, audience: kind, sources: recipient.sources, test: testMode },
      });
    } catch (error) {
      emailsFailed += 1;
      const messageText = error instanceof Error ? error.message : "Unknown email error";
      await logEmail({
        to_email: email,
        to_name: recipient.name,
        subject: message.subject,
        template: testMode ? "weekly_digest_test" : kind === "member" ? "weekly_member_digest" : "weekly_admin_report",
        status: "failed",
        error: messageText,
        metadata: { ...metadataBase, audience: kind, sources: recipient.sources, test: testMode },
      });
    }
  }

  const memberMessage = renderMemberDigest({
    ...digestData,
    recipientEmail: memberRecipients[0]?.email,
  });
  const adminMessage = renderAdminWeeklyDigest({
    ...adminData,
    recipientEmail: adminRecipients[0]?.email,
  });

  // Each recipient gets a personalised unsubscribe link without rebuilding the full template.
  const personalise = (html: string, email: string) =>
    html.replace(
      /\/unsubscribe\?email=[^"']*/g,
      `/unsubscribe?email=${encodeURIComponent(email)}`,
    );

  await mapWithLimit(memberRecipients, 5, async (recipient) => {
    await deliver(recipient, "member", { ...memberMessage, html: personalise(memberMessage.html, recipient.email) }, sentMembers);
  });
  await mapWithLimit(adminRecipients, 5, async (recipient) => {
    await deliver(recipient, "admin", { ...adminMessage, html: personalise(adminMessage.html, recipient.email) }, sentAdmins);
  });

  const result: RunResult = {
    ok: emailsFailed === 0,
    weekKey: window.weekKey,
    weekLabel: window.label,
    skipped: false,
    reason: emailsFailed ? `${emailsFailed} email(s) failed` : undefined,
    memberRecipients: memberRecipients.length,
    adminRecipients: adminRecipients.length,
    emailsSent,
    emailsFailed,
    skippedDuplicates,
  };

  if (options.returnHtml) {
 result.memberHtml = memberMessage.html;
 result.adminHtml = adminMessage.html;
 }

 if (!dryRun && !testMode) await completeRun(
    supabase,
    window.weekKey,
    emailsFailed === 0 ? "sent" : "failed",
    { memberRecipients: memberRecipients.length, adminRecipients: adminRecipients.length, emailsSent, emailsFailed },
    emailsFailed ? result.reason : undefined,
  );

  return result;
}
