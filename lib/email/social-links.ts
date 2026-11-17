import { getAllSocialLinks } from "../services/social-links.service";

export const SOCIAL_LINKS_PLACEHOLDER = "<!--ABF_SOCIAL_LINKS-->";

type EmailSocialLink = {
  platform: string;
  url: string;
};

const BADGES: Record<string, { label: string; name: string; color: string }> = {
  facebook: { label: "f", name: "Facebook", color: "#1877f2" },
  twitter: { label: "X", name: "X", color: "#111827" },
  x: { label: "X", name: "X", color: "#111827" },
  instagram: { label: "IG", name: "Instagram", color: "#c13584" },
  linkedin: { label: "in", name: "LinkedIn", color: "#0a66c2" },
  youtube: { label: "▶", name: "YouTube", color: "#ff0000" },
  tiktok: { label: "♪", name: "TikTok", color: "#111827" },
  whatsapp: { label: "WA", name: "WhatsApp", color: "#25d366" },
  telegram: { label: "TG", name: "Telegram", color: "#229ed9" },
  email: { label: "@", name: "Email", color: "#aa322b" },
  other: { label: "↗", name: "Website", color: "#6b5b55" },
};

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!)
  );
}

export async function getEmailSocialLinks(): Promise<EmailSocialLink[]> {
  try {
    const links = await getAllSocialLinks();
    return links.filter((link) => /^(https?:|mailto:)/i.test(link.url.trim()));
  } catch (error) {
    console.error("Failed to fetch social links for email:", error);
    return [];
  }
}

export function renderEmailSocialLinks(links: EmailSocialLink[]): string {
  if (links.length === 0) return "";

  const items = links
    .map((link) => {
      const key = link.platform.trim().toLowerCase();
      const badge = BADGES[key] ?? BADGES.other;
      const href = esc(link.url.trim());
      return `<td style="padding:0 4px">
<a href="${href}" aria-label="${esc(badge.name)}" style="text-decoration:none">
<span style="display:inline-block;width:30px;height:30px;line-height:30px;border-radius:50%;background:${badge.color};color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:800;text-align:center;">${esc(badge.label)}</span>
</a>
</td>`;
    })
    .join("");

  return `<div style="margin-top:16px;text-align:center">
<div style="color:#b8a99f;font-size:10px;letter-spacing:.14em;font-weight:700;margin-bottom:8px">FOLLOW US</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;border-collapse:collapse"><tr>${items}</tr></table>
</div>`;
}
