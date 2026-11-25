import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { executiveSchema } from "@/lib/validations/executives.schema";
import {
  getExecutiveById,
  updateExecutiveById,
  removeExecutive,
} from "@/lib/services/executives.service";
import { notifyAdmins } from "@/lib/email/admin-notifications";

type RouteContext = { params: Promise<{ id: string }> };

// GET executive by id
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await requirePermission("executives", "read");
    const { id } = await params;

    const executive = await getExecutiveById(id);
    if (!executive) {
      return NextResponse.json({ success: false, error: "Executive not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: executive });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Get executive error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch executive" }, { status: 500 });
  }
}

// PATCH update executive
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requirePermission("executives", "update");
    const { id } = await params;

    const body = await request.json();
    const validatedData = executiveSchema.partial().parse(body);

    const executive = await updateExecutiveById(id, validatedData);

    await notifyAdmins({
      title: "Executive Updated",
      message: `"${executive.full_name}" (${executive.position}) has been updated.`,
      ctaUrl: "/admin/executives",
      ctaLabel: "View Executives",
    });

    return NextResponse.json({ success: true, data: executive });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid executive details" },
        { status: 400 }
      );
    }
    console.error("Update executive error:", error);
    return NextResponse.json({ success: false, error: "Failed to update executive" }, { status: 500 });
  }
}

// DELETE executive
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requirePermission("executives", "delete");
    const { id } = await params;

    // Read the name first so the notification can say who was removed.
    const executive = await getExecutiveById(id);
    await removeExecutive(id);

    await notifyAdmins({
      title: "Executive Removed",
      message: `"${executive?.full_name ?? "An executive"}" has been removed.`,
      ctaUrl: "/admin/executives",
      ctaLabel: "View Executives",
    });

    return NextResponse.json({ success: true, message: "Executive deleted" });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Delete executive error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete executive" }, { status: 500 });
  }
}
