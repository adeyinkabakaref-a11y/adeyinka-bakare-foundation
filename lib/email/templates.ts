import { baseEmailLayout } from "./layout";
import { formatEventDate, formatEventTime } from "@/lib/utils/dates";

const DEFAULT_PRESIDENT_IMAGE =
 "https://kgopmlpskjrygklbjqrk.supabase.co/storage/v1/object/public/public-images/200a0d3c-7f1b-4036-a2d9-da9f73469bfa/other/1794867011644-Glory_Adeniran.jpg.jpeg";

function esc(s: string){ return s.replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!)); }

function presidentSignature(opts: { fromName: string; presidentImage?: string | null }) {
 const image = opts.presidentImage || DEFAULT_PRESIDENT_IMAGE;
 return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 0;border-collapse:collapse"><tr>
<td style="padding-right:12px;vertical-align:middle"><img src="${esc(image)}" alt="${esc(opts.fromName)}" width="52" height="52" style="display:block;width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid #f8c84d;" /></td>
<td style="vertical-align:middle;color:#8a7a74;font-size:13px;line-height:1.6">Warm regards,<br/><strong style="color:#2d1816">${esc(opts.fromName)}</strong><br/><span style="font-size:11px">President, Adeyinka Bakare Fellowship</span></td>
</tr></table>`;
}

export function adminInviteEmail(opts: { fullName: string; email: string; role: string; inviteUrl: string; expiresAt: string; inviterName: string; logoUrl?: string }) {
  const roleLabel = opts.role.replace("_"," ").replace(/\b\w/g, c=>c.toUpperCase());
  const subject = `You're invited to join Adeyinka Bakare Fellowship as ${roleLabel}`;
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px"><strong>${esc(opts.inviterName)}</strong> invited you to join <strong>Adeyinka Bakare Fellowship</strong> as <strong>${esc(roleLabel)}</strong>.</p>
    <p style="margin:0 0 20px"><a href="${opts.inviteUrl}" style="display:inline-block;background:#aa322b;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:800;font-size:13px;letter-spacing:.02em">Accept invite & set password →</a></p>
    <p style="margin:0 0 8px;color:#6b5b55;font-size:13px">Or copy this link:</p>
    <p style="word-break:break-all;margin:0 0 16px"><a href="${opts.inviteUrl}" style="color:#aa322b">${opts.inviteUrl}</a></p>
    <div style="background:#fff9eb;border:1px solid #f0e6d8;border-radius:12px;padding:12px 14px;font-size:12px;color:#6b5b55">
      <strong style="color:#2d1816">Invite details</strong><br/>
      Email: ${esc(opts.email)}<br/>
      Role: ${esc(roleLabel)}<br/>
      Expires: ${esc(new Date(opts.expiresAt).toLocaleString())}
    </div>
    <p style="margin:16px 0 0;color:#8a7a74;font-size:11px">If you didn't expect this invite, you can safely ignore it — the link will expire.</p>
  `, { title: `You're invited as ${roleLabel}`, subtitle: "Set your password within 7 days to activate your account.", preheader: `You've been invited as ${roleLabel} — accept within 7 days`, logoUrl: opts.logoUrl });
  const text = `You're invited, ${opts.fullName}\n\n${opts.inviterName} invited you as ${roleLabel}.\n\nAccept: ${opts.inviteUrl}\nExpires: ${opts.expiresAt}\n`;
  return { subject, html, text };
}

export function welcomeEmail(opts: { fullName: string; loginUrl: string }) {
  const subject = `Welcome to Adeyinka Bakare Fellowship`;
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">Your account is active — you can now sign in to the ABF admin console.</p>
    <p style="margin:0 0 20px"><a href="${opts.loginUrl}" style="display:inline-block;background:#2d1816;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:800">Sign in →</a></p>
  `, { title: `Welcome, ${esc(opts.fullName)}`, subtitle: "Your ABF account is ready." });
  const text = `Welcome, ${opts.fullName}\nSign in at ${opts.loginUrl}`;
  return { subject, html, text };
}

export function memberWelcomeEmail(opts: {
  fullName: string;
  email?: string | null;
  department?: string | null;
  level?: string | null;
  session?: string | null;
  siteUrl?: string;
}) {
  const siteUrl = (opts.siteUrl || "https://abfimpact.org").replace(/\/$/, "");
  const links = {
    about: `${siteUrl}/about`,
    programmes: `${siteUrl}/programmes`,
    beneficiaries: `${siteUrl}/beneficiaries`,
    news: `${siteUrl}/news`,
    events: `${siteUrl}/events`,
    getInvolved: `${siteUrl}/get-involved`,
    contact: `${siteUrl}/contact`,
  };

  const subject = `Welcome to the Adeyinka Bakare Fellowship — your membership is confirmed`;

  const html = baseEmailLayout(`
    <p style="margin:0 0 14px">Hi <strong>${esc(opts.fullName)}</strong>,</p>
    <p style="margin:0 0 14px">Welcome to the <strong>Adeyinka Bakare Fellowship (ABF)</strong> — the student fellowship of the Department of Information Technology, University of Ilorin. We're thrilled to have you join a community of students who care about <em>academic excellence, leadership, integrity, innovation and service</em>.</p>
    <p style="margin:0 0 18px">Your membership has been recorded and our team has been notified. Below is everything you need to know to get the most out of your fellowship.</p>

    <h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;color:#2d1816">Your details</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fbf4f1;border:1px solid #f0d6cc;border-radius:12px;padding:14px 16px;font-size:13px;color:#2d1816;line-height:1.7">
      <tr><td style="padding:2px 0"><strong>Name:</strong> ${esc(opts.fullName)}</td></tr>
      ${opts.email ? `<tr><td style="padding:2px 0"><strong>Email:</strong> ${esc(opts.email)}</td></tr>` : ""}
      ${opts.department ? `<tr><td style="padding:2px 0"><strong>Department:</strong> ${esc(opts.department)}</td></tr>` : ""}
      ${opts.level ? `<tr><td style="padding:2px 0"><strong>Level:</strong> ${esc(opts.level)}</td></tr>` : ""}
      ${opts.session ? `<tr><td style="padding:2px 0"><strong>Session:</strong> ${esc(opts.session)}</td></tr>` : ""}
    </table>

    <h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;color:#2d1816">About ABF</h2>
    <p style="margin:0 0 12px">The Adeyinka Bakare Fellowship exists to empower students of the Department of Information Technology at the University of Ilorin through <strong>scholarships, mentorship, career development and collaborative learning</strong>.</p>
    <p style="margin:0 0 4px"><strong>Our vision</strong> — a generation of well-equipped, innovative and responsible IT professionals from the University of Ilorin.</p>
    <p style="margin:0 0 14px"><strong>Our mission</strong> — to support students academically, professionally and personally, and to build a community that gives back.</p>

    <h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;color:#2d1816">Your member benefits</h2>
    <ul style="margin:0 0 16px 18px;padding:0;color:#2d1816;line-height:1.7;font-size:14px">
      <li><strong>Scholarship &amp; grant access</strong> — periodic scholarship and bursary windows, advertised via email and the website.</li>
      <li><strong>Mentorship</strong> — pairing with senior students and alumni who can guide your academics and career.</li>
      <li><strong>Career development</strong> — CV reviews, mock interviews, internships and job-shadow opportunities.</li>
      <li><strong>Events &amp; programmes</strong> — workshops, hackathons, career talks and networking sessions throughout the year.</li>
      <li><strong>Community</strong> — a supportive network of IT students across all levels.</li>
    </ul>

    <h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;color:#2d1816">What to do next</h2>
    <ol style="margin:0 0 18px 18px;padding:0;color:#2d1816;line-height:1.7;font-size:14px">
      <li>Keep an eye on your inbox — invitations to our orientation and first event of the session are sent within the first week.</li>
      <li>Explore the <a href="${links.programmes}" style="color:#aa322b;font-weight:600">programmes we run</a> and the <a href="${links.events}" style="color:#aa322b;font-weight:600">upcoming events</a>.</li>
      <li>Get to know our <a href="${links.beneficiaries}" style="color:#aa322b;font-weight:600">scholarship beneficiaries</a> — these are ABF members past and present.</li>
      <li>Read <a href="${links.about}" style="color:#aa322b;font-weight:600">who we are</a> and the values we uphold.</li>
      <li>Consider <a href="${links.getInvolved}" style="color:#aa322b;font-weight:600">volunteering</a> — the fellowship runs because members like you give their time.</li>
    </ol>

    <h2 style="margin:24px 0 8px;font-family:Georgia,serif;font-size:18px;color:#2d1816">Stay connected</h2>
    <p style="margin:0 0 12px">Follow ABF on social media for daily updates, opportunities and community stories:</p>
<p style="margin:0 0 12px">Follow ABF on social media for daily updates, opportunities and community stories — the links are in the footer below.</p>
    <p style="margin:0 0 18px">For questions, partnerships or support, simply reply to this email or visit the <a href="${links.contact}" style="color:#aa322b;font-weight:600">contact page</a>.</p>

    <div style="background:#fff9eb;border:1px solid #f0e6d8;border-radius:12px;padding:14px 16px;font-size:13px;color:#6b5b55;line-height:1.6">
      <strong style="color:#2d1816">A quick note on conduct.</strong><br/>
      ABF is a respectful, inclusive and accountable community. By joining, you agree to treat fellow members, staff and partners with dignity, and to uphold the values of the fellowship. Misconduct of any kind is taken seriously and may result in membership review.
    </div>

    <p style="margin:18px 0 0">We are glad to have you. Welcome aboard.</p>
    <p style="margin:6px 0 0;color:#6b5b55;font-size:13px">— The Adeyinka Bakare Fellowship Team</p>
  `, {
    title: `Welcome, ${esc(opts.fullName)}!`,
    subtitle: "Your membership with ABF is confirmed — here's everything you need to know.",
    preheader: `Welcome to ABF, ${esc(opts.fullName)}! Your membership is confirmed. Read on for benefits, next steps and links.`,
    heroImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
  });

  const text = `Welcome to the Adeyinka Bakare Fellowship, ${opts.fullName}!

Your membership is confirmed. We're thrilled to have you join the ABF community — students of the Department of Information Technology, University of Ilorin, united by academic excellence, leadership, integrity, innovation and service.

Your details
-----------
${opts.email ? `Email: ${opts.email}` : ""}
${opts.department ? `Department: ${opts.department}` : ""}
${opts.level ? `Level: ${opts.level}` : ""}
${opts.session ? `Session: ${opts.session}` : ""}

About ABF
---------
The Adeyinka Bakare Fellowship empowers IT students at the University of Ilorin through scholarships, mentorship, career development and collaborative learning.

Vision: a generation of well-equipped, innovative and responsible IT professionals from the University of Ilorin.
Mission: to support students academically, professionally and personally, and to build a community that gives back.

Your benefits
-------------
- Scholarship & grant access (periodic windows, advertised by email)
- Mentorship pairing with seniors and alumni
- Career development (CV reviews, mock interviews, internships)
- Workshops, hackathons, career talks and networking
- A supportive IT student community

Next steps
---------
1. Watch your inbox for the orientation invite and the first event of the session.
2. Explore programmes: ${links.programmes}
3. Upcoming events: ${links.events}
4. Read about us: ${links.about}
5. Volunteer: ${links.getInvolved}

Stay connected
--------------
Follow ABF on social media using the links in the email footer.

Contact: ${links.contact}

A quick note on conduct: ABF is a respectful, inclusive and accountable community. Treat fellow members, staff and partners with dignity, and uphold the values of the fellowship. Misconduct may result in membership review.

We are glad to have you. Welcome aboard.

— The Adeyinka Bakare Fellowship Team
`;

  return { subject, html, text };
}

export function otpEmail(opts: { fullName: string; code: string; purpose: string; logoUrl?: string }) {
  const purposeLabel = opts.purpose === "ENABLE" ? "enable email verification" : "sign in to your account";
  const subject = `Your verification code: ${opts.code}`;
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">Use this verification code to ${purposeLabel}:</p>
    <div style="background:#fbf4f1;border:2px solid #2d1816;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
      <span style="font-size:32px;font-weight:800;letter-spacing:4px;color:#2d1816">${esc(opts.code)}</span>
    </div>
    <p style="margin:0 0 8px;color:#6b5b55;font-size:13px">This code expires in 10 minutes.</p>
    <p style="margin:16px 0 0;color:#8a7a74;font-size:11px">If you didn't request this code, you can safely ignore it.</p>
  `, { title: "Verification code", subtitle: `Your code is valid for 10 minutes`, logoUrl: opts.logoUrl });
  const text = `Your verification code is: ${opts.code}\n\nThis code expires in 10 minutes.`;
  return { subject, html, text };
}

export function volunteerReceivedEmail(opts: { fullName: string; interest?: string }) {
  const subject = `We received your volunteer application — thank you!`;
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">Thank you for applying to volunteer${opts.interest ? ` for <strong>${esc(opts.interest)}</strong>` : ""} with ABF. Our team will review your application and reach out shortly.</p>
    <p style="margin:0 0 16px;color:#6b5b55;font-size:12px">You'll get an email when your status changes.</p>
  `, { title: "Application received", subtitle: "We'll be in touch soon.", heroImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" });
  const text = `Hi ${opts.fullName}, we received your volunteer application.`;
  return { subject, html, text };
}

export function volunteerStatusEmail(opts: { fullName: string; status: string; }) {
  const subject = `Your ABF volunteer status: ${opts.status}`;
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">Your volunteer application status is now <strong>${esc(opts.status)}</strong>.</p>
  `, { title: `Status: ${esc(opts.status)}`, subtitle: "Thank you for staying connected." });
  const text = `Hi ${opts.fullName}, status: ${opts.status}`;
  return { subject, html, text };
}

export function adminNotifyEmail(opts: { title: string; message: string; ctaUrl?: string; ctaLabel?: string; baseUrl?: string }) {
  const subject = opts.title;
  const fullCtaUrl = opts.ctaUrl && opts.baseUrl ? `${opts.baseUrl}${opts.ctaUrl}` : opts.ctaUrl;
  const html = baseEmailLayout(`
    <p style="margin:0 0 12px">${esc(opts.message)}</p>
    ${fullCtaUrl ? `<p style="margin:16px 0"><a href="${fullCtaUrl}" style="display:inline-block;background:#aa322b;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700">${esc(opts.ctaLabel || "View in admin")}</a></p>` : ""}
  `, { title: opts.title, subtitle: "New activity on ABF" });
  const text = `${opts.title}\n\n${opts.message}${fullCtaUrl?`\n${fullCtaUrl}`:""}`;
  return { subject, html, text };
}

export function newsletterEmail(opts: { title: string; excerpt?: string; url?: string; recipientEmail?: string; fullName?: string }) {
  const subject = opts.title;
  const greeting = opts.fullName ? `Hi ${esc(opts.fullName)},` : "Hello there,";
  const html = baseEmailLayout(`
    <p style="margin:0 0 12px">${greeting}</p>
    <p style="margin:0 0 12px">${esc(opts.excerpt || "")}</p>
    ${opts.url ? `<p><a href="${opts.url}" style="display:inline-block;background:#2d1816;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Read more →</a></p>` : ""}
  `, {
    title: opts.title,
    heroImage: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=1200&q=80",
    recipientEmail: opts.recipientEmail,
  });
  const text = `${opts.title}\n\n${greeting.replace(/<[^>]+>/g, "")}\n\n${opts.excerpt || ""}${opts.url ? `\n\n${opts.url}` : ""}\n\nUnsubscribe: ${process.env.NEXT_PUBLIC_SITE_URL || "https://abfimpact.org"}/unsubscribe?email=${encodeURIComponent(opts.recipientEmail || "")}`;
  return { subject, html, text };
}

export function totpEnabledEmail(opts: { fullName: string; loginUrl: string }) {
  const subject = "Authenticator App MFA Enabled";
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">Two-factor authentication using an authenticator app has been successfully enabled on your ABF admin account.</p>
    <p style="margin:0 0 16px">You will now be required to enter a code from your authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.) when logging in.</p>
    <div style="background:#fff9eb;border:1px solid #f0e6d8;border-radius:12px;padding:12px 14px;font-size:12px;color:#6b5b55">
      <strong style="color:#2d1816">Important:</strong> Please save your recovery codes in a safe place. They can be used to access your account if you lose your authenticator app.
    </div>
    <p style="margin:16px 0 0;color:#8a7a74;font-size:11px">If you didn't enable this feature, please contact support immediately.</p>
  `, { title: "Authenticator App MFA Enabled", subtitle: "Your account is now more secure." });
  const text = `Hi ${opts.fullName},\n\nAuthenticator app MFA has been enabled on your ABF admin account.\n\nPlease save your recovery codes in a safe place.`;
  return { subject, html, text };
}

export function totpDisabledEmail(opts: { fullName: string; loginUrl: string }) {
  const subject = "Authenticator App MFA Disabled";
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">Two-factor authentication using an authenticator app has been disabled on your ABF admin account.</p>
    <p style="margin:0 0 16px">Your account is now less secure. We recommend enabling MFA again to protect your account.</p>
    <p style="margin:16px 0 0;color:#8a7a74;font-size:11px">If you didn't disable this feature, please contact support immediately.</p>
  `, { title: "Authenticator App MFA Disabled", subtitle: "Your account security has changed." });
  const text = `Hi ${opts.fullName},\n\nAuthenticator app MFA has been disabled on your ABF admin account.\n\nIf you didn't disable this, please contact support.`;
  return { subject, html, text };
}

export function passkeyAddedEmail(opts: { fullName: string; deviceName: string; loginUrl: string }) {
  const subject = "New Passkey Added";
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">A new passkey (<strong>${esc(opts.deviceName)}</strong>) has been added to your ABF admin account.</p>
    <p style="margin:0 0 16px">You can now use this device for passwordless authentication using biometrics (fingerprint, face recognition, etc.).</p>
    <p style="margin:16px 0 0;color:#8a7a74;font-size:11px">If you didn't add this passkey, please contact support immediately.</p>
  `, { title: "New Passkey Added", subtitle: "Passwordless authentication enabled." });
  const text = `Hi ${opts.fullName},\n\nA new passkey (${opts.deviceName}) has been added to your ABF admin account.\n\nIf you didn't add this, please contact support.`;
  return { subject, html, text };
}

export function passkeyRemovedEmail(opts: { fullName: string; deviceName: string; loginUrl: string }) {
  const subject = "Passkey Removed";
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">The passkey <strong>${esc(opts.deviceName)}</strong> has been removed from your ABF admin account.</p>
    <p style="margin:0 0 16px">You can no longer use this device for passwordless authentication.</p>
    <p style="margin:16px 0 0;color:#8a7a74;font-size:11px">If you didn't remove this passkey, please contact support immediately.</p>
  `, { title: "Passkey Removed", subtitle: "Your authentication options have changed." });
  const text = `Hi ${opts.fullName},\n\nThe passkey (${opts.deviceName}) has been removed from your ABF admin account.\n\nIf you didn't remove this, please contact support.`;
  return { subject, html, text };
}

export function recoveryCodesGeneratedEmail(opts: { fullName: string; loginUrl: string }) {
  const subject = "Recovery Codes Generated";
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">New recovery codes have been generated for your authenticator app MFA.</p>
    <div style="background:#fff9eb;border:1px solid #f0e6d8;border-radius:12px;padding:12px 14px;font-size:12px;color:#6b5b55">
      <strong style="color:#2d1816">Important:</strong> Please save your new recovery codes in a safe place. They can be used to access your account if you lose your authenticator app.
    </div>
    <p style="margin:16px 0 0;color:#8a7a74;font-size:11px">If you didn't generate new recovery codes, please contact support immediately.</p>
  `, { title: "Recovery Codes Generated", subtitle: "Save your new codes in a safe place." });
  const text = `Hi ${opts.fullName},\n\nNew recovery codes have been generated for your authenticator app MFA.\n\nPlease save them in a safe place.`;
  return { subject, html, text };
}

export function recoveryCodesLowWarningEmail(opts: { fullName: string; remaining: number; loginUrl: string }) {
  const subject = "Recovery Codes Running Low";
  const html = baseEmailLayout(`
    <p style="margin:0 0 16px">Hi ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">You have only <strong>${opts.remaining} recovery code${opts.remaining === 1 ? '' : 's'}</strong> remaining for your authenticator app MFA.</p>
    <p style="margin:0 0 16px">Recovery codes are used to access your account if you lose your authenticator app. We recommend regenerating your recovery codes before you run out.</p>
    <p style="margin:16px 0 0;color:#8a7a74;font-size:11px">This is an automated security notification.</p>
  `, { title: "Recovery Codes Running Low", subtitle: "Regenerate your codes soon." });
  const text = `Hi ${opts.fullName},\n\nYou have only ${opts.remaining} recovery code${opts.remaining === 1 ? '' : 's'} remaining.\n\nPlease regenerate your recovery codes soon.`;
  return { subject, html, text };
}

/**
 * Thank you email sent to applicants after they submit an event registration form.
 * Branded as from Glory Adeniran, ABF President.
 */
export function sendEventApplicationEmail(opts: {
  fullName: string;
  email: string;
  eventTitle: string;
  eventDate: string;
presidentImage?: string | null;
  location?: string;
  fromName: string;
  siteUrl: string;
  whatsappLink?: string;
  meetLink?: string;
}) {
  const eventDate = formatEventDate(opts.eventDate);
  const html = baseEmailLayout(
    `<p style="margin:0 0 16px">Dear ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">Thank you for your interest in <strong>${esc(opts.eventTitle)}</strong>! Your registration has been received successfully.</p>
    <div style="background:#fff9eb;border:1px solid #f0e6d8;border-radius:12px;padding:14px 16px;font-size:13px;color:#2d1816">
      <strong style="color:#2d1816">Event Details</strong><br/>
      <strong>Event:</strong> ${esc(opts.eventTitle)}<br/>
      <strong>Date:</strong> ${eventDate} · ${formatEventTime(opts.eventDate)}${opts.location ? `<br/><strong>Location:</strong> ${esc(opts.location)}` : ""}
    </div>
    ${opts.meetLink ? `<p style="margin:16px 0 8px"><strong>Join the Event Online</strong></p><p style="margin:0 0 8px">Click the button below to join the event via Google Meet at the scheduled time:</p><p style="margin:0 0 16px"><a href="${esc(opts.meetLink)}" style="display:inline-block;background:#aa322b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:700;font-size:13px">Join Google Meet →</a></p>` : ""}
    ${opts.whatsappLink ? `<p style="margin:16px 0 8px"><strong>Join Our Community</strong></p><p style="margin:0 0 8px">Connect with other attendees and stay updated with event announcements by joining our WhatsApp community:</p><p style="margin:0 0 16px"><a href="${esc(opts.whatsappLink)}" style="display:inline-block;background:#d9960d;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:700;font-size:13px">Join WhatsApp Community →</a></p>` : ""}
    <p style="margin:16px 0 0;color:#8a7a74;font-size:13px">We're excited to have you with us. Please save this email for your records.</p>
    ${presidentSignature({ fromName: opts.fromName, presidentImage: opts.presidentImage })}`,
    {
      title: `You're Registered for ${esc(opts.eventTitle)}`,
      subtitle: "Your registration has been confirmed. We look forward to seeing you there!",
      preheader: `Thank you for registering for ${opts.eventTitle} — see you on event day!`,
    }
  );
  const text = `Dear ${opts.fullName},\n\nThank you for registering for ${opts.eventTitle}.\n\nEvent: ${opts.eventTitle}\nDate: ${eventDate} · ${formatEventTime(opts.eventDate)}${opts.location ? `\nLocation: ${opts.location}` : ""}\n${opts.meetLink ? `\nGoogle Meet: ${opts.meetLink}` : ""}${opts.whatsappLink ? `\nWhatsApp Community: ${opts.whatsappLink}` : ""}\n\nWe're excited to have you with us. Please save this email for your records.\n\nWarm regards,\n${opts.fromName}\nPresident, Adeyinka Bakare Fellowship`;
  return { subject: `You're Registered — ${opts.eventTitle}`, html, text };
}

/**
 * Event reminder email sent to all registrants before/during the event day.
 * Branded as from Glory Adeniran, ABF President.
 */
export function sendEventReminderEmail(opts: {
  fullName: string;
  email: string;
  eventTitle: string;
  eventDate: string;
presidentImage?: string | null;
  location?: string;
  meetLink?: string;
  fromName: string;
  siteUrl: string;
  reminderType?: "day_before" | "day_of";
}) {
  const eventDate = formatEventDate(opts.eventDate);
  const timeStr = formatEventTime(opts.eventDate);
  const isDayOf = opts.reminderType === "day_of";
  const html = baseEmailLayout(
    `<p style="margin:0 0 16px">Dear ${esc(opts.fullName)},</p>
    ${isDayOf ? `<p style="margin:0 0 16px"><strong>Today is the day!</strong> Your event starts soon.</p>` : `<p style="margin:0 0 16px">This is a friendly reminder about the event happening soon.</p>`}
    <div style="background:#fff9eb;border:1px solid #f0e6d8;border-radius:12px;padding:14px 16px;font-size:13px;color:#2d1816">
      <strong style="color:#2d1816">Event Reminder</strong><br/>
      <strong>Event:</strong> ${esc(opts.eventTitle)}<br/>
      <strong>Date:</strong> ${eventDate}<br/>
      <strong>Time:</strong> ${timeStr}${opts.location ? `<br/><strong>Location:</strong> ${esc(opts.location)}` : ""}
    </div>
    ${opts.meetLink ? `<p style="margin:16px 0 8px">Join the session via Google Meet:</p><p style="margin:0 0 16px"><a href="${esc(opts.meetLink)}" style="display:inline-block;background:#aa322b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:999px;font-weight:700;font-size:13px">Join Google Meet →</a></p><p style="margin:0 0 16px;color:#6b5b55;font-size:12px">Copy and paste this link if the button doesn't work: ${esc(opts.meetLink)}</p>` : ""}
    ${presidentSignature({ fromName: opts.fromName, presidentImage: opts.presidentImage })}`,
    {
      title: isDayOf ? `Today: ${esc(opts.eventTitle)}` : `Reminder: ${esc(opts.eventTitle)}`,
      subtitle: isDayOf ? "The event is happening today!" : "See you soon at the event!",
      preheader: isDayOf ? "The event is happening today — join us!" : "Friendly reminder about your upcoming event.",
    }
  );
  const text = `Dear ${opts.fullName},\n\n${isDayOf ? "Today is the day! " : ""}Your event ${opts.eventTitle} is happening.\n\nEvent: ${opts.eventTitle}\nDate: ${eventDate}\nTime: ${timeStr}${opts.location ? `\nLocation: ${opts.location}` : ""}\n${opts.meetLink ? `\nGoogle Meet: ${opts.meetLink}` : ""}\n\nWarm regards,\n${opts.fromName}\nPresident, Adeyinka Bakare Fellowship`;
  return { subject: isDayOf ? `Today: ${opts.eventTitle}` : `Reminder: ${opts.eventTitle}`, html, text };
}

/**
 * Google Meet link email — sent to registrants with the meet link for the event.
 */
export function sendEventMeetLinkEmail(opts: {
  fullName: string;
  email: string;
  eventTitle: string;
  eventDate: string;
presidentImage?: string | null;
  meetLink: string;
  fromName: string;
}) {
  const eventDate = formatEventDate(opts.eventDate);
  const html = baseEmailLayout(
    `<p style="margin:0 0 16px">Dear ${esc(opts.fullName)},</p>
    <p style="margin:0 0 16px">Your Google Meet link for <strong>${esc(opts.eventTitle)}</strong> is ready.</p>
    <div style="text-align:center;padding:20px 0">
      <a href="${esc(opts.meetLink)}" style="display:inline-block;background:#aa322b;color:#fff;text-decoration:none;padding:14px 30px;border-radius:999px;font-weight:800;font-size:15px;letter-spacing:.02em">Join Google Meet →</a>
    </div>
    <p style="margin:0 0 8px;color:#6b5b55;font-size:12px">Event: ${esc(opts.eventTitle)}</p>
    <p style="margin:0 0 8px;color:#6b5b55;font-size:12px">Date: ${eventDate}</p>
    <p style="margin:0 0 16px;color:#6b5b55;font-size:12px">Link: ${esc(opts.meetLink)}</p>
    ${presidentSignature({ fromName: opts.fromName, presidentImage: opts.presidentImage })}`,
    {
      title: `Google Meet Link — ${esc(opts.eventTitle)}`,
      subtitle: "Your virtual meeting link is ready",
      preheader: "Use this link to join the online session",
    }
  );
  const text = `Dear ${opts.fullName},\n\nYour Google Meet link for ${opts.eventTitle} (${eventDate} · ${formatEventTime(opts.eventDate)}):\n\n${opts.meetLink}\n\nWarm regards,\n${opts.fromName}\nPresident, Adeyinka Bakare Fellowship`;
  return { subject: `Meet Link: ${opts.eventTitle}`, html, text };
}
