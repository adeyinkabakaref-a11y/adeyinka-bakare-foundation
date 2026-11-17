import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { getFormResponses, getEventResponses, deleteResponse as deleteResp, getResponse } from "@/lib/services/responses.service";
import { findEventById } from "@/lib/repositories/events.repository";

// GET responses — by formId, eventId, or responseId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("events", "read");
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("form_id");
    const eventId = searchParams.get("event_id");

    let responses;
    if (formId) {
      responses = await getFormResponses(formId);
    } else if (eventId) {
      responses = await getEventResponses(eventId);
    } else {
      // Try event ID first, then response ID
      try {
        const event = await findEventById(id);
        if (event) {
          responses = await getEventResponses(id);
        } else {
          const resp = await getResponse(id);
          responses = resp ? [resp] : [];
        }
      } catch {
        responses = await getFormResponses(id);
      }
    }

    return NextResponse.json({ success: true, data: responses });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Get responses error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch responses" }, { status: 500 });
  }
}

// DELETE response
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("events", "delete");
    const { id } = await params;
    await deleteResp(id);
    return NextResponse.json({ success: true, message: "Response deleted" });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Delete response error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete response" }, { status: 500 });
  }
}
