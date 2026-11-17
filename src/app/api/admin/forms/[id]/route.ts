import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { findEventById } from "@/lib/repositories/events.repository";
import { getEventForms, createForm, updateForm, deleteForm } from "@/lib/services/forms.service";
import { notifyAdmins } from "@/lib/email/admin-notifications";

// GET all forms for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("events", "read");
    const { id } = await params;

    const event = await findEventById(id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const forms = await getEventForms(id);
    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Get forms error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

// POST create form for an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("events", "create");
    const { id } = await params;

    const event = await findEventById(id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const form = await createForm({
      ...body,
      event_id: id,
    });

    await notifyAdmins({
      title: "New Form Created",
      message: `A new registration form "${form.title}" was created for event "${event.title}".`,
      ctaUrl: `/admin/events/${id}/forms`,
      ctaLabel: "View Forms",
    });

    return NextResponse.json({ success: true, data: form }, { status: 201 });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Create form error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create form" },
      { status: 500 }
    );
  }
}
