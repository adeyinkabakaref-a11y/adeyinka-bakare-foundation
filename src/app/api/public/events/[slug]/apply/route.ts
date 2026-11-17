import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { findEventBySlug } from "@/lib/repositories/events.repository";
import { getActiveForm } from "@/lib/services/forms.service";
import { getFieldsByForm } from "@/lib/repositories/forms.repository";
import { createResponse } from "@/lib/services/responses.service";
import { sendEventApplicationEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await findEventBySlug(slug);
    if (!event || event.status !== "published") {
      return NextResponse.json({ success: false, error: "Event not found or not published" }, { status: 404 });
    }
    const form = await getActiveForm(event.id);
    if (!form) {
      return NextResponse.json({ success: false, error: "No active registration form" }, { status: 404 });
    }
    const fields = await getFieldsByForm(form.id);
return NextResponse.json({ success: true, data: { has_form: true, form_id: form.id, event_id: event.id, fields } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to check form" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get event by slug
    const event = await findEventBySlug(slug);
    if (!event || event.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Event not found or not published" },
        { status: 404 }
      );
    }

    // Get active form for this event
    const form = await getActiveForm(event.id);
    if (!form) {
      return NextResponse.json(
        { success: false, error: "No active registration form for this event" },
        { status: 404 }
      );
    }

    // Get form fields
    const fields = await getFieldsByForm(form.id);

    // Validate submission
    const body = await request.json();

    // Extract core fields from dynamic form fields if they exist
    const full_name = body["Full Name"] || body["full_name"] || "";
    const email = body["Email Address"] || body["email"] || "";
    const phone = body["Whatsapp Number"] || body["phone"] || null;

    // Validate core fields
    if (!full_name || !email) {
      return NextResponse.json(
        { success: false, error: "Full name and email are required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Build responses object from all form fields
    const responses: Record<string, unknown> = {};
    for (const field of fields) {
      if (body[field.label] !== undefined) {
        responses[field.label] = body[field.label];
      }
    }

    // Get IP and user agent
    const ipAddress =
      (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "").split(",")[0] ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    // Create response
    const response = await createResponse({
      form_id: form.id,
      event_id: event.id,
      full_name,
      email,
      phone,
      responses,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    // Send thank you email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const fromName = event.email_from_name || "Glory Adeniran";
    try {
      const emailData = sendEventApplicationEmail({
        fullName: response.full_name,
        email: response.email,
        eventTitle: event.title,
        eventDate: event.start_at,
presidentImage: event.president_image || undefined,
        location: event.location || undefined,
        fromName,
        siteUrl,
        whatsappLink: event.whatsapp_link || undefined,
        meetLink: event.meet_link || undefined,
      });
      await sendEmail({
        to: response.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });
    } catch (emailErr) {
      console.error("Failed to send thank you email:", emailErr);
    }

    return NextResponse.json(
      { success: true, data: { response, form_title: form.title } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Apply to event error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit application";
    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof z.ZodError ? 422 : 500 }
    );
  }
}
