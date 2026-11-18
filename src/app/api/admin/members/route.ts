import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { memberSchema } from "@/lib/validations/members.schema";
import {
  getAllMembers,
  getMemberById,
  createNewMember,
  updateMemberById,
  removeMember
} from "@/lib/services/members.service";
import { notifyAdmins } from "@/lib/email/admin-notifications";
import { sendEmail } from "@/lib/email/send";
import { memberWelcomeEmail } from "@/lib/email/templates";
import { logEmail } from "@/lib/email/log";

// GET all members
export async function GET(request: NextRequest) {
  try {
    const { user } = await requirePermission("members", "read");
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    const members = await getAllMembers();
    
    // Filter by status if provided
    const filtered = status 
      ? members.filter(m => m.status === status)
      : members;
    
    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Get members error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST create member
export async function POST(request: NextRequest) {
  try {
    const { user } = await requirePermission("members", "create");

    const body = await request.json();
    const validatedData = memberSchema.parse(body);

    const member = await createNewMember(validatedData, user.id);

    // Send welcome email to the new member
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
        await logEmail({ to_email: email, to_name: validatedData.full_name, subject, template: "member_welcome", html_preview: html, status: "sent", provider_id: info?.messageId, metadata: { member_id: (member as any)?.id } });
      }
    } catch (e: any) {
      try {
        const em = (validatedData as any).email;
        if (em) await logEmail({ to_email: em, subject: "Member welcome", template: "member_welcome", status: "failed", error: e.message });
      } catch {}
    }

    // Notify admins about new member
    await notifyAdmins({
      title: "New Member Added",
      message: `A new member "${validatedData.full_name}" has been added to the fellowship.`,
      ctaUrl: "/admin/members",
      ctaLabel: "View Members",
    });

    return NextResponse.json(
      { success: true, data: member },
      { status: 201 }
    );
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Create member error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create member" },
      { status: 500 }
    );
  }
}
