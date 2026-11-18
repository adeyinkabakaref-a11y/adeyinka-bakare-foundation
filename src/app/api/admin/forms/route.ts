import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { createClient } from "@/lib/supabase/server";
import { createForm } from "@/lib/services/forms.service";
import { countFormResponses } from "@/lib/services/responses.service";

export async function GET() {
  try {
    await requirePermission("events", "read");

    const supabase = await createClient();
    const [eventsRes, formsRes] = await Promise.all([
      supabase.from("events").select("*").order("title", { ascending: true }),
      supabase.from("event_forms").select("*").order("title", { ascending: true }),
    ]);

    if (eventsRes.error) throw eventsRes.error;
    if (formsRes.error) throw formsRes.error;

    const forms = formsRes.data ?? [];
    const counts = Object.fromEntries(
      await Promise.all(forms.map(async (form) => [form.id, await countFormResponses(form.id)]))
    );

    return NextResponse.json({
      success: true,
      data: { events: eventsRes.data ?? [], forms, counts },
    });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Get all forms error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("events", "create");

    const body = await request.json();
    const form = await createForm(body);

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
