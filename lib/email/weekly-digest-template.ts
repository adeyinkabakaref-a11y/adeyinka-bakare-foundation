import { SOCIAL_LINKS_PLACEHOLDER } from "./social-links";

export type WeeklyNarrative = {
  opening: string;
  foodForThought: string;
  studentAdvice: string;
  closing: string;
};

export type DigestLinkItem = {
  title: string;
  excerpt?: string | null;
  href: string;
  image?: string | null;
  dateLabel?: string;
  meta?: string;
};

export type WeeklyDigestData = {
  site: { name: string; tagline: string; logo: string; url: string };
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  issue: string;
  news: DigestLinkItem[];
  events: DigestLinkItem[];
  upcoming: DigestLinkItem[];
  narrative: WeeklyNarrative;
  stats: {
    newMembers: number;
    totalMembers: number;
    newSubscribers: number;
    totalSubscribers: number;
    newVolunteers: number;
    pendingVolunteers: number;
    applications: number;
    formResponses: number;
    newNews: number;
    publishedEvents: number;
  };
  recipientEmail?: string;
  unsubscribeUrl?: string;
};

export type AdminWeeklyDigestData = WeeklyDigestData & {
  admin: {
    adminCount: number;
    activeSessions: number;
    totpEnabled: number;
    passkeyEnabled: number;
    emailOtpEnabled: number;
    mfaRequired: number;
    auditEvents: number;
    adminInvites: number;
    emailsSent: number;
    failedEmails: number;
    notifications: number;
    mediaUploads: number;
    contentUpdates: number;
    formSubmissions: number;
  };
  auditRows: Array<{ action: string; entity: string; actor: string; dateLabel: string }>;
  recommendations: string[];
  dashboardUrl: string;
};

const C = {
  ink: "#2d1816",
  maroon: "#aa322b",
  maroonDark: "#551a18",
  maroonDeeper: "#3b1314",
  gold: "#f8c84d",
  goldDark: "#8a6208",
  cream: "#fffdf8",
  sand: "#f8f2e8",
  muted: "#6b5b55",
  line: "#eadfd1",
  white: "#ffffff",
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function nl2br(value: string): string {
  return esc(value).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br/>");
}

function badge(text: string, bg = C.maroon, color = C.white): string {
  return `<span style="display:inline-block;padding:5px 11px;border-radius:999px;background:${bg};color:${color};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${esc(text)}</span>`;
}

function iconTile(glyph: string, bg = C.maroon): string {
  return `<span class="abf-icon" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;background:${bg};color:#fff;font-weight:800;font-size:15px;line-height:1">${esc(glyph)}</span>`;
}

function navButtons(siteUrl: string): string {
  const links = [
    { label: "This week", href: `${siteUrl}/news#week` },
    { label: "Opportunities", href: `${siteUrl}/events` },
    { label: "Give a hand", href: `${siteUrl}/get-involved` },
    { label: "Read online", href: `${siteUrl}/news` },
  ];
  return links
    .map(
      (l) =>
        `<a href="${esc(l.href)}" class="abf-pill" style="display:inline-block;padding:9px 14px;margin:3px;border-radius:999px;background:${C.white};color:${C.maroon};border:1px solid ${C.line};font-size:12px;font-weight:700;text-decoration:none;white-space:nowrap">${esc(l.label)}</a>`,
    )
    .join("");
}

function statCard(label: string, value: number, glyph: string, accent = C.maroon): string {
  return `
  <td width="25%" valign="top" class="abf-stat-cell" style="padding:6px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.white};border:1px solid ${C.line};border-radius:14px;">
      <tr><td style="padding:14px 12px;text-align:center">
        <div style="margin-bottom:6px">${iconTile(glyph, accent)}</div>
        <div class="abf-stat-value" style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:${C.ink};line-height:1.1">${value}</div>
        <div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:${C.muted};margin-top:5px;line-height:1.35">${esc(label)}</div>
      </td></tr>
    </table>
  </td>`;
}

function storyCard(item: DigestLinkItem, index: number, siteUrl: string): string {
  const image = safeUrl(item.image, `${siteUrl}/brand/logo.png`);
  return `
  <tr><td style="padding:9px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:16px;overflow:hidden;background:${C.white}">
      <tr>
        <td width="128" class="abf-story-image" valign="top" style="background:${C.sand}">
          <a href="${esc(item.href)}"><img src="${esc(image)}" alt="" width="128" style="display:block;width:100%;height:auto;min-height:104px;object-fit:cover" /></a>
        </td>
        <td valign="top" style="padding:15px 16px">
          <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:${C.maroon};font-weight:800">${esc(item.meta || (index === 0 ? "Featured story" : "Newsroom"))}</div>
          <h3 style="margin:6px 0 5px;font-family:Georgia,serif;font-size:16px;line-height:1.35;color:${C.ink}">
            <a href="${esc(item.href)}" style="color:${C.ink};text-decoration:none">${esc(item.title)}</a>
          </h3>
          ${item.excerpt ? `<p style="margin:0;color:${C.muted};font-size:12px;line-height:1.6">${esc(item.excerpt).slice(0, 210)}${item.excerpt.length > 210 ? "…" : ""}</p>` : ""}
          <a href="${esc(item.href)}" class="abf-text-link" style="display:inline-block;margin-top:10px;color:${C.maroon};font-size:12px;font-weight:800;text-decoration:none">Read the full story →</a>
        </td>
      </tr>
    </table>
  </td></tr>`;
}

function eventRow(item: DigestLinkItem): string {
  return `
  <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="34" valign="top">${iconTile("◆", C.goldDark)}</td>
      <td valign="top" style="padding-left:10px">
        <div style="font-size:13px;font-weight:800;color:${C.ink}"><a href="${esc(item.href)}" style="color:${C.ink};text-decoration:none">${esc(item.title)}</a></div>
        <div style="font-size:11px;color:${C.muted};margin-top:3px">${esc(item.meta || "")}${item.excerpt ? ` · ${esc(item.excerpt)}` : ""}</div>
      </td>
      <td valign="middle" align="right" style="white-space:nowrap"><a href="${esc(item.href)}" style="color:${C.maroon};font-size:12px;font-weight:800;text-decoration:none">View →</a></td>
    </tr></table>
  </td></tr>`;
}

function fold(id: string, title: string, kicker: string, body: string, open = true): string {
  return `
  <details id="${esc(id)}" class="abf-fold" ${open ? "open" : ""} style="margin:14px 0;border:1px solid ${C.line};border-radius:16px;background:${C.white};overflow:hidden">
    <summary style="cursor:pointer;list-style:none;padding:16px 18px;background:linear-gradient(90deg,${C.maroon} 0%,${C.maroonDark} 100%);color:${C.white};font-weight:800;font-size:14px;letter-spacing:.01em">
      <span style="display:inline-block;margin-right:9px;color:${C.gold}">▸</span>${esc(title)}
      <span style="float:right;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.gold}">${esc(kicker)}</span>
    </summary>
    <div class="abf-fold-body" style="padding:18px">${body}</div>
  </details>`;
}

const SHARED_STYLES = `
<style type="text/css">
  a { color: ${C.maroon}; }
  body, table, td, p, h1, h2, h3 { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  .abf-shell { width:100% !important; max-width:680px !important; }
  .abf-pad { padding-left:30px !important; padding-right:30px !important; }
  .abf-stat-wrap { display:block !important; width:100% !important; }
  .abf-stat-cell { display:inline-block !important; width:47% !important; box-sizing:border-box !important; }
  .abf-story-image { width:100% !important; }
  .abf-story-image img { height:170px !important; }
  .abf-hide-mobile { display:none !important; }
  .abf-nav { text-align:center !important; }
  .abf-fold summary::marker, .abf-fold summary::-webkit-details-marker { display:none; }
  .abf-fold[open] .abf-fold-body { display:block !important; }
  .abf-fold:not([open]) .abf-fold-body { display:none !important; }
  @keyframes abfSheen { 0% { background-position:0% 50% } 50% { background-position:100% 50% } 100% { background-position:0% 50% } }
  @keyframes abfRise { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
  .abf-animate { animation:abfRise .7s ease both; }
  .abf-hero-band { background-size:200% 200% !important; animation:abfSheen 11s ease infinite; }
  @media (prefers-reduced-motion: reduce) {
    .abf-animate, .abf-hero-band { animation:none !important; }
  }
  @media screen and (max-width:620px) {
    .abf-shell { max-width:100% !important; }
    .abf-pad { padding-left:18px !important; padding-right:18px !important; }
    .abf-stat-cell { width:47% !important; }
    .abf-stat-value { font-size:21px !important; }
    .abf-hide-mobile { display:none !important; }
    .abf-nav a { display:inline-block !important; }
  }
  @media (prefers-color-scheme: dark) {
    .abf-card, .abf-fold-body { background:#fffdf8 !important; }
  }
</style>`;

function shellHead(data: WeeklyDigestData, title: string, preheader: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${esc(title)}</title>
${SHARED_STYLES}
</head>
<body style="margin:0;padding:0;background:${C.cream};font-family:Manrope,Inter,Arial,sans-serif;color:${C.ink}">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand};padding:20px 10px">
<tr><td align="center">
<table role="presentation" class="abf-shell" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:${C.white};border-radius:22px;overflow:hidden;border:1px solid ${C.line};box-shadow:0 24px 60px rgba(45,24,22,.13)">`;
}

function shellFoot(data: WeeklyDigestData, showUnsubscribe = true): string {
  const site = esc(data.site.url);
  const unsub = showUnsubscribe
    ? esc(data.unsubscribeUrl || `${site}/unsubscribe?email=${encodeURIComponent(data.recipientEmail || "")}`)
    : "";
  return `
<tr><td style="background:${C.maroonDeeper};padding:26px 28px;color:#f6e3dd">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-family:Georgia,serif;font-size:17px;color:${C.white}">${esc(data.site.name)}</td>
    <td align="right" style="font-size:11px;line-height:1.7">
      <a href="${site}" style="color:${C.gold};text-decoration:none">Website</a> ·
      <a href="${site}/news" style="color:${C.gold};text-decoration:none">Newsroom</a>
      ${unsub ? `<br/><a href="${unsub}" style="color:#f6e3dd;text-decoration:underline">Unsubscribe</a>` : ""}
    </td>
  </tr></table>
  <div style="margin-top:12px;font-size:11px;line-height:1.6;color:#d8bdb7">${esc(data.site.tagline)} · © ${new Date().getFullYear()} ABF</div>
  ${SOCIAL_LINKS_PLACEHOLDER}
</td></tr>
</table>
<div style="max-width:680px;margin:14px auto 0;text-align:center;color:${C.muted};font-size:11px;line-height:1.6">
  You are receiving this because you are a member, subscriber, or registered supporter of ABF.
</div>
</td></tr></table>
</body></html>`;
}

export function renderMemberDigest(data: WeeklyDigestData): { subject: string; html: string; text: string } {
  const subject = `${data.issue} · ABF Weekly: ${data.weekLabel}`;
  const preheader = `${data.narrative.foodForThought.slice(0, 110)} — plus this week's news, events and student guidance.`;
  const newsHtml = data.news.length
    ? data.news.map((n, i) => storyCard(n, i, data.site.url)).join("")
    : `<tr><td style="padding:16px 0;color:${C.muted};font-size:13px">No new stories were published this week. Visit the newsroom for the latest updates.</td></tr>`;
  const eventsHtml = data.events.length
    ? data.events.map((e) => eventRow(e)).join("")
    : `<tr><td style="padding:12px 0;color:${C.muted};font-size:13px">No new events were added this week. Upcoming opportunities are listed below.</td></tr>`;
  const upcomingHtml = data.upcoming.length
    ? data.upcoming.map((e) => eventRow(e)).join("")
    : `<tr><td style="padding:12px 0;color:${C.muted};font-size:13px">No upcoming events are published yet. Keep an eye on the events page.</td></tr>`;

  const html = `${shellHead(data, subject, preheader)}
<tr><td class="abf-hero-band" style="padding:30px 28px;background:linear-gradient(120deg,#aa322b 0%,#7a211e 48%,#3b1314 100%);color:${C.white}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td>
      <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${C.gold};font-weight:800">The Adeyinka Bakare Fellowship · Weekly Letter</div>
      <h1 class="abf-animate" style="margin:10px 0 8px;font-family:Georgia,serif;font-size:31px;line-height:1.18;color:${C.white}">A good week to keep going.</h1>
      <p style="margin:0;color:#f5dfda;font-size:13px;line-height:1.65;max-width:480px">${esc(data.weekLabel)} · Real updates from the fellowship, a thought to carry, and practical next steps for students.</p>
      <div style="margin-top:16px">${badge(`Issue ${esc(data.issue)}`, C.gold, C.ink)} ${badge("Members & friends", "rgba(255,255,255,.16)", C.white)}</div>
    </td>
    <td align="right" class="abf-hide-mobile" valign="top"><img src="${esc(safeUrl(data.site.logo, `${data.site.url}/brand/logo.png`))}" width="54" height="54" alt="ABF logo" style="display:block;width:54px;height:54px;border-radius:14px;background:#fff;object-fit:cover;padding:5px" /></td>
  </tr></table>
</td></tr>

<tr><td class="abf-pad" style="padding:20px 28px;background:${C.cream};border-bottom:1px solid ${C.line}">
  <div class="abf-nav">${navButtons(data.site.url)}</div>
</td></tr>

<tr><td class="abf-pad" style="padding:26px 28px 6px;background:${C.white}">
  <div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${C.maroon};font-weight:800">At a glance</div>
  <h2 style="margin:6px 0 4px;font-family:Georgia,serif;font-size:22px;color:${C.ink}">What moved this week</h2>
  <table role="presentation" class="abf-stat-wrap" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr>
    ${statCard("New stories", data.stats.newNews, "✎", C.maroon)}
    ${statCard("Events shared", data.stats.publishedEvents, "◆", C.goldDark)}
    ${statCard("New members", data.stats.newMembers, "♟", C.maroon)}
    ${statCard("Applications", data.stats.applications, "✓", C.goldDark)}
  </tr></table>
</td></tr>

<tr><td class="abf-pad" style="padding:18px 28px 26px;background:${C.white}">
  ${fold("week", "Food for thought", "Read · 2 min", `
    <p style="margin:0 0 12px;font-family:Georgia,serif;font-size:17px;line-height:1.65;color:${C.ink}">${nl2br(data.narrative.foodForThought)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};border-left:3px solid ${C.gold};border-radius:0 12px 12px 0"><tr><td style="padding:13px 15px;color:${C.muted};font-size:12px;line-height:1.7">${nl2br(data.narrative.opening)}</td></tr></table>
  `)}
  ${fold("newsroom", "From the newsroom", `${data.news.length} stor${data.news.length === 1 ? "y" : "ies"}`, newsHtml)}
  ${fold("calendar", "On the calendar", `${data.upcoming.length} upcoming`, `
    <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${C.maroon};font-weight:800;margin-bottom:6px">New this week</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${eventsHtml}</table>
    <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${C.maroon};font-weight:800;margin:16px 0 6px">Coming up</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${upcomingHtml}</table>
  `)}
  ${fold("playbook", "Student playbook", "Practical advice", `
    <p style="margin:0 0 12px;color:${C.ink};font-size:13px;line-height:1.75">${nl2br(data.narrative.studentAdvice)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td width="30" valign="top">${iconTile("1", C.maroon)}</td><td style="padding:6px 0 10px 10px;font-size:12px;line-height:1.65"><strong style="color:${C.ink}">Show up consistently.</strong> Small, repeated actions beat occasional bursts. Pick one fellowship activity and commit to it this week.</td></tr>
      <tr><td width="30" valign="top">${iconTile("2", C.goldDark)}</td><td style="padding:6px 0 10px 10px;font-size:12px;line-height:1.65"><strong style="color:${C.ink}">Build in public.</strong> Share what you are learning with a peer or mentor. Clarity comes from explaining it simply.</td></tr>
      <tr><td width="30" valign="top">${iconTile("3", C.maroon)}</td><td style="padding:6px 0 10px 10px;font-size:12px;line-height:1.65"><strong style="color:${C.ink}">Ask early.</strong> Applications, mentorship and help are easier when you ask before a deadline, not after it.</td></tr>
    </table>
  `)}
  ${fold("pulse", "Community pulse", "Numbers", `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:${C.ink}">
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Registered members</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.totalMembers}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Newsletter subscribers</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.totalSubscribers}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">New subscribers this week</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.newSubscribers}</td></tr>
    </table>
  `)}
</td></tr>

<tr><td style="padding:26px 28px;background:linear-gradient(120deg,#8a241f 0%,#aa322b 100%);color:${C.white}">
  <div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${C.gold};font-weight:800">One last thing</div>
  <p style="margin:8px 0 16px;font-family:Georgia,serif;font-size:17px;line-height:1.6;max-width:520px">${nl2br(data.narrative.closing)}</p>
  <a href="${esc(`${data.site.url}/get-involved`)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:${C.gold};color:${C.ink};font-size:13px;font-weight:900;text-decoration:none">Get involved →</a>
</td></tr>
${shellFoot(data)}
`;

  const text = [
    subject,
    "",
    data.narrative.opening,
    "",
    data.narrative.foodForThought,
    "",
    "NEWS",
    ...data.news.map((n) => `• ${n.title} — ${n.href}`),
    "",
    "UPCOMING EVENTS",
    ...data.upcoming.map((e) => `• ${e.title} — ${e.meta || ""} ${e.href}`),
    "",
    data.narrative.studentAdvice,
    "",
    data.narrative.closing,
    "",
    `${data.site.name} — ${data.site.url}`,
  ].join("\n");

  return { subject, html, text };
}

export function renderAdminWeeklyDigest(data: AdminWeeklyDigestData): { subject: string; html: string; text: string } {
  const subject = `🔐 ${data.issue} · ABF Admin & Security Weekly — ${data.weekLabel}`;
  const preheader = `Admin operations, MFA coverage, audit activity, email health and database summary for ${data.weekLabel}.`;
  const auditRows = data.auditRows.length
    ? data.auditRows
        .map(
          (r) => `<tr>
            <td style="padding:9px 8px;border-bottom:1px solid ${C.line};font-size:11px;font-weight:800;color:${C.maroon}">${esc(r.action)}</td>
            <td style="padding:9px 8px;border-bottom:1px solid ${C.line};font-size:11px;color:${C.ink}">${esc(r.entity)}</td>
            <td style="padding:9px 8px;border-bottom:1px solid ${C.line};font-size:11px;color:${C.muted}">${esc(r.actor)}</td>
            <td style="padding:9px 8px;border-bottom:1px solid ${C.line};font-size:11px;color:${C.muted};text-align:right">${esc(r.dateLabel)}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="4" style="padding:14px 8px;color:${C.muted};font-size:12px">No audited admin actions recorded in this window.</td></tr>`;
  const recommendations = data.recommendations
    .map(
      (r, i) => `<tr><td width="28" valign="top">${iconTile(String(i + 1), C.goldDark)}</td><td style="padding:5px 0 9px 9px;font-size:12px;line-height:1.65;color:${C.ink}">${esc(r)}</td></tr>`,
    )
    .join("");

  const html = `${shellHead(data, subject, preheader)}
<tr><td class="abf-hero-band" style="padding:30px 28px;background:linear-gradient(120deg,#3b1314 0%,#551a18 45%,#aa322b 100%);color:${C.white}">
  <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${C.gold};font-weight:800">Confidential · Administration only</div>
  <h1 style="margin:10px 0 8px;font-family:Georgia,serif;font-size:29px;line-height:1.2;color:${C.white}">Weekly operations &amp; security report</h1>
  <p style="margin:0;color:#f3ded9;font-size:13px;line-height:1.65">${esc(data.weekLabel)}. This is the internal companion to the member letter: what changed, what was submitted, and what needs attention.</p>
  <div style="margin-top:16px">${badge(`Issue ${esc(data.issue)}`, C.gold, C.ink)} ${badge("Admin eyes only", "rgba(255,255,255,.16)", C.white)}</div>
</td></tr>

<tr><td class="abf-pad" style="padding:22px 28px;background:${C.cream};border-bottom:1px solid ${C.line}">
  <a href="${esc(data.dashboardUrl)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:${C.maroon};color:${C.white};font-size:13px;font-weight:800;text-decoration:none">Open admin dashboard →</a>
  <span style="margin-left:10px;font-size:11px;color:${C.muted}">Review, verify, then act.</span>
</td></tr>

<tr><td class="abf-pad" style="padding:26px 28px 8px;background:${C.white}">
  <div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${C.maroon};font-weight:800">Security posture</div>
  <table role="presentation" class="abf-stat-wrap" width="100%" cellpadding="0" cellspacing="0" style="margin-top:13px"><tr>
    ${statCard("Active admins", data.admin.adminCount, "♜", C.maroon)}
    ${statCard("MFA required", data.admin.mfaRequired, "✓", C.goldDark)}
    ${statCard("TOTP enabled", data.admin.totpEnabled, "⌁", C.maroon)}
    ${statCard("Passkeys", data.admin.passkeyEnabled, "◈", C.goldDark)}
  </tr></table>
</td></tr>

<tr><td class="abf-pad" style="padding:18px 28px 26px;background:${C.white}">
  ${fold("security-detail", "Authentication & sessions", "Detailed", `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:${C.ink}">
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">TOTP authenticator enabled</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.admin.totpEnabled} / ${data.admin.adminCount}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Passkey enabled</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.admin.passkeyEnabled} / ${data.admin.adminCount}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Email OTP enabled</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.admin.emailOtpEnabled} / ${data.admin.adminCount}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Active recorded sessions</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.admin.activeSessions}</td></tr>
      <tr><td style="padding:8px 0">New admin invitations</td><td align="right" style="padding:8px 0;font-weight:800">${data.admin.adminInvites}</td></tr>
    </table>
  `)}
  ${fold("audit", "Audit trail this week", `${data.admin.auditEvents} events`, `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:12px;overflow:hidden">
      <tr style="background:${C.sand}"><th align="left" style="padding:9px 8px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">Action</th><th align="left" style="padding:9px 8px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">Entity</th><th align="left" style="padding:9px 8px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">Actor</th><th align="right" style="padding:9px 8px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">When</th></tr>
      ${auditRows}
    </table>
  `)}
  ${fold("database", "Database & content summary", "Counts", `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:${C.ink}">
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Stories published</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.newNews}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Events published</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.publishedEvents}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">New members</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.newMembers}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">New newsletter subscribers</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.newSubscribers}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">New volunteers</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.newVolunteers}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Event applications</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.applications}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Other form responses</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.stats.formResponses}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Media uploads</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.admin.mediaUploads}</td></tr>
      <tr><td style="padding:8px 0">Content records updated</td><td align="right" style="padding:8px 0;font-weight:800">${data.admin.contentUpdates}</td></tr>
    </table>
  `)}
  ${fold("email-health", "Email delivery health", "SMTP", `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:${C.ink}">
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Emails logged this week</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800">${data.admin.emailsSent}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid ${C.line}">Failed sends</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${C.line};font-weight:800;color:${data.admin.failedEmails ? C.maroon : C.ink}">${data.admin.failedEmails}</td></tr>
      <tr><td style="padding:8px 0">In-app notifications raised</td><td align="right" style="padding:8px 0;font-weight:800">${data.admin.notifications}</td></tr>
    </table>
  `)}
  ${fold("actions", "Recommended follow-ups", "Action list", `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${recommendations}</table>
  `)}
</td></tr>

<tr><td style="padding:22px 28px;background:${C.maroonDeeper};color:#f6e3dd">
  <div style="font-size:11px;line-height:1.7">This report is generated automatically for the ABF admin team. Do not forward it. Verify any security action inside the dashboard before making changes.</div>
</td></tr>
${shellFoot(data, false)}
`;

  const text = [
    subject,
    "",
    `Admin count: ${data.admin.adminCount}`,
    `TOTP enabled: ${data.admin.totpEnabled}`,
    `Passkeys: ${data.admin.passkeyEnabled}`,
    `Active sessions: ${data.admin.activeSessions}`,
    `Audit events: ${data.admin.auditEvents}`,
    `Failed emails: ${data.admin.failedEmails}`,
    "",
    "RECOMMENDATIONS",
    ...data.recommendations.map((r, i) => `${i + 1}. ${r}`),
    "",
    `${data.dashboardUrl}`,
  ].join("\n");

  return { subject, html, text };
}
