import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { executiveSchema } from "@/lib/validations/executives.schema";
import { getAllExecutives, createNewExecutive } from "@/lib/services/executives.service";
import { notifyAdmins } from "@/lib/email/admin-notifications";

// GET all executives (every status)
export async function GET(request: NextRequest) {
  try {
    await requirePermission("executives", "read");

    const status = new URL(request.url).searchParams.get("status");
    const executives = await getAllExecutives();
    const filtered = status ? executives.filter((e) => e.status === status) : executives;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Get executives error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch executives" }, { status: 500 });
  }
}

// POST create executive
export async function POST(request: NextRequest) {
  try {
    await requirePermission("executives", "create");

    const body = await request.json();
    const validatedData = executiveSchema.parse(body);

    const executive = await createNewExecutive(validatedData);

    await notifyAdmins({
      title: "New Executive Added",
      message: `"${validatedData.full_name}" has been added as ${validatedData.position}.`,
      ctaUrl: "/admin/executives",
      ctaLabel: "View Executives",
    });

    return NextResponse.json({ success: true, data: executive }, { status: 201 });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid executive details" },
        { status: 400 }
      );
    }
    console.error("Create executive error:", error);
    return NextResponse.json({ success: false, error: "Failed to create executive" }, { status: 500 });
  }
}
