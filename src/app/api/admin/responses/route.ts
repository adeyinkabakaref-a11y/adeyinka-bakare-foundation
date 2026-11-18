import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await requirePermission("events", "read");

    const supabase = await createClient();
    const [eventsRes, formsRes, responsesRes] = await Promise.all([
      supabase.from("events").select("*").order("title", { ascending: true }),
      supabase.from("event_forms").select("*").order("title", { ascending: true }),
      supabase
        .from("form_responses")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(500),
    ]);

    if (eventsRes.error) throw eventsRes.error;
    if (formsRes.error) throw formsRes.error;
    if (responsesRes.error) throw responsesRes.error;

    return NextResponse.json({
      success: true,
      data: {
        events: eventsRes.data ?? [],
        forms: formsRes.data ?? [],
        responses: responsesRes.data ?? [],
      },
    });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Get all responses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
}
