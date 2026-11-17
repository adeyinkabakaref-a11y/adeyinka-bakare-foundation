import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { getEventResponses } from "@/lib/services/responses.service";
import { findEventById } from "@/lib/repositories/events.repository";
import { sendEventReminderEmail, sendEventMeetLinkEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { logEmail } from "@/lib/email/log";
import { createAdminClient } from "@/lib/supabase/admin";

// POST send email to all respondents of an event
// Body: { event_id, type: "reminder"|"meet_link", subject, message, schedule?: "day_before"|"day_of" }
export async function POST(request: NextRequest) {
  try {
    const { user } = await requirePermission("events", "create");
    const body = await request.json();

    const { event_id, type, subject, message, schedule } = body;

    if (!event_id) {
      return NextResponse.json({ success: false, error: "event_id is required" }, { status: 400 });
    }

    const event = await findEventById(event_id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const responses = await getEventResponses(event_id);
    if (!responses.length) {
      return NextResponse.json({ success: false, error: "No responses found for this event" }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const fromName = event.email_from_name || "Glory Adeniran";

    let sent = 0, failed = 0;

    for (const response of responses) {
      try {
        let emailData;
        if (type === "meet_link" && event.meet_link) {
          emailData = sendEventMeetLinkEmail({
            fullName: response.full_name,
            email: response.email,
            eventTitle: event.title,
            eventDate: event.start_at,
presidentImage: event.president_image || undefined,
            meetLink: event.meet_link,
            fromName,
          });
        } else {
          emailData = sendEventReminderEmail({
            fullName: response.full_name,
            email: response.email,
            eventTitle: event.title,
            eventDate: event.start_at,
presidentImage: event.president_image || undefined,
            location: event.location || undefined,
            meetLink: event.meet_link || undefined,
            fromName,
            siteUrl,
            reminderType: schedule === "day_of" ? "day_of" : "day_before",
          });
        }

        if (subject) emailData.subject = subject;
        if (message) {
          emailData.html = emailData.html.replace(
            "</p>",
            `<p style="margin:12px 0 0">${message}</p></p>`
          );
        }

        await sendEmail({
          to: response.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        });

        await logEmail({
          to_email: response.email,
          subject: emailData.subject,
          template: type === "meet_link" ? "meet_link_reminder" : "event_reminder",
          html_preview: emailData.html,
          status: "sent",
          created_by: user.id,
        });

        sent++;
      } catch (emailErr) {
        console.error("Email failed for", response.email, emailErr);
        failed++;
        await logEmail({
          to_email: response.email,
          subject: subject || `${event.title} reminder`,
          template: type,
          html_preview: "",
          status: "failed",
          error: emailErr instanceof Error ? emailErr.message : "Unknown error",
          created_by: user.id,
        });
      }
    }

    // Notify admins
    const supabase = createAdminClient();
    const { data: admins } = await supabase.from("profiles").select("id").in("role", ["super_admin", "admin"]);
    if (admins?.length) {
      const rows = admins.map((a) => ({
        recipient_id: a.id,
        type: "info",
        title: `${type === "meet_link" ? "Meet link" : "Reminder"} emails sent`,
        message: `Sent ${type === "meet_link" ? "meet link" : "reminder"} emails to ${sent} respondent(s)${failed ? ` (${failed} failed)` : ""} for "${event.title}".`,
        data: { event_id, type, sent, failed },
      }));
      await supabase.from("notifications").insert(rows);
    }

    return NextResponse.json({
      success: true,
      data: { sent, failed, total: responses.length },
    });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Send response email error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send emails" },
      { status: 500 }
    );
  }
}
