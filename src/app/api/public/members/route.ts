import { NextRequest, NextResponse } from "next/server";
import { memberSchema } from "@/lib/validations/members.schema";
import { createMember } from "@/lib/repositories/members.repository";
import { sendEmail } from "@/lib/email/send";
import { memberWelcomeEmail } from "@/lib/email/templates";
import { logEmail } from "@/lib/email/log";
import { notifyAdmins } from "@/lib/email/admin-notifications";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = memberSchema.parse(body);

    // Check if member already exists by email
    const supabase = createAdminClient();
    if (validatedData.email) {
      const { data: existingMember } = await supabase
        .from("members")
        .select("id, full_name")
        .eq("email", validatedData.email)
        .maybeSingle();

      if (existingMember) {
        return NextResponse.json(
          { success: false, error: "You are already registered as a member. Please contact us if you need to update your information." },
          { status: 409 }
        );
      }
    }

    // Create member using admin client to bypass RLS
    const { data: member, error } = await supabase
      .from("members")
      .insert({
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone: validatedData.phone,
        department: validatedData.department,
        level: validatedData.level,
        session: validatedData.session,
        photo: validatedData.photo,
        status: validatedData.status || "active",
        joined_at: validatedData.joined_at ? new Date(validatedData.joined_at).toISOString() : null,
      })
      .select("*")
      .single();

    if (error) throw error;

    try {
      const { subject, html, text } = memberWelcomeEmail({
        fullName: validatedData.full_name,
        email: (validatedData as any).email,
        department: (validatedData as any).department,
        level: (validatedData as any).level,
        session: (validatedData as any).session,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      });
      const email = (validatedData as any).email;
      if (email) {
        const info: any = await sendEmail({ to: email, subject, html, text });
        await logEmail({ to_email: email, to_name: validatedData.full_name, subject, template: "member_welcome", html_preview: html, status: "sent", provider_id: info?.messageId, metadata: { member_id: member?.id } });
      }
    } catch (e: any) { try { const em = (validatedData as any).email; if (em) await logEmail({ to_email: em, subject: "Member welcome", template: "member_welcome", status: "failed", error: e.message }); } catch {} }
    try { await notifyAdmins({ title: "New Member Registered", message: `${validatedData.full_name} has registered as a member${(validatedData as any).department ? ` -- ${(validatedData as any).department}` : ""}.`, ctaUrl: "/admin/members", ctaLabel: "View Members" }); } catch {}

    return NextResponse.json(
      {
        success: true,
        data: member,
        message: "Member registration submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Member registration error:", error);

    if (error instanceof Error && error.message.includes("Invalid email")) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to submit member registration" },
      { status: 500 }
    );
  }
}
