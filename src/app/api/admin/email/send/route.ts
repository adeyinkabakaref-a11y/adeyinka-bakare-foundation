import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { baseEmailLayout } from "@/lib/email/layout";
import { logEmail, notifyAdmins } from "@/lib/email/log";

type Personalization = { name?: string; email?: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!)
  );
}

function personalize(value: string, vars: Personalization, escape: boolean) {
  return value.replace(/\{\s*(name|email)\s*\}/g, (_, key: string) => {
    const replacement = vars[key as keyof Personalization] ?? "";
    return escape ? escapeHtml(replacement) : replacement;
  });
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requirePermission("email", "create");
    const body = await request.json();
    const { to, subject, html, text, template = "custom", recipients = [], personalizations = {} } = body;
    if (!subject || (!html && !text)) {
      return NextResponse.json({ success: false, error: "Subject and body required" }, { status: 400 });
    }

    let targets: string[] = [];
    if (Array.isArray(recipients) && recipients.length) {
      for (const r of recipients) {
        if (typeof r !== "string") continue;
        if (r.includes("@")) targets.push(r);
        else if (r === "admins") {
          const adm = createAdminClient();
          const { data: users } = await adm.auth.admin.listUsers();
          targets.push(...(users?.users ?? []).map((u) => u.email).filter(Boolean) as string[]);
        } else if (r === "newsletter") {
          const supabase = createAdminClient();
          const { data } = await supabase.from("newsletter_subscribers").select("email").eq("status", "subscribed");
          targets.push(...(data?.map((d) => d.email) ?? []));
        } else if (r === "members") {
          const supabase = createAdminClient();
          const { data } = await supabase.from("members").select("email").not("email", "is", null);
          targets.push(...(data?.map((d) => d.email).filter(Boolean) as string[] ?? []));
        } else if (r === "volunteers") {
          const supabase = createAdminClient();
          const { data } = await supabase.from("volunteers").select("email");
          targets.push(...(data?.map((d) => d.email) ?? []));
        }
      }
    }
    if (Array.isArray(to) && to.length) targets.push(...to);
    else if (typeof to === "string" && to) targets.push(to);
    targets = [...new Set(targets.map((s) => String(s).toLowerCase().trim()).filter(Boolean))];
    if (!targets.length) return NextResponse.json({ success: false, error: "No recipients" }, { status: 400 });

    let sent = 0;
    let failed = 0;
    for (const email of targets) {
      try {
        const vars: Personalization = personalizations[email] ?? {
          name: email.split("@")[0],
          email,
        };
        const personalizedHtml = personalize(html || `<p>${text || ""}</p>`, vars, true);
        const personalizedText = personalize(text || "", vars, false);
        const finalHtml = personalizedHtml.includes("<html")
          ? personalizedHtml
          : baseEmailLayout(personalizedHtml, { title: subject, preheader: subject.slice(0, 120) });

        const info = await sendEmail({ to: email, subject, html: finalHtml, text: personalizedText });
        await logEmail({
          to_email: email,
          subject,
          template,
          html_preview: finalHtml,
          status: "sent",
          provider_id: (info as { messageId?: string })?.messageId,
          metadata: { studio: true },
          created_by: user.id,
        });
        sent++;
      } catch (error) {
        await logEmail({
          to_email: email,
          subject,
          template,
          html_preview: "",
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          created_by: user.id,
        });
        failed++;
      }
    }
    await notifyAdmins({
      title: `Email sent: ${subject}`,
      message: `Studio sent "${subject}" to ${sent} recipient(s)${failed ? ` (${failed} failed)` : ""}.`,
      type: "info",
      data: { subject, sent, failed },
    });

    return NextResponse.json({ success: true, data: { sent, failed, total: targets.length } });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: message.includes("Forbidden") ? 403 : 500 }
    );
  }
}
