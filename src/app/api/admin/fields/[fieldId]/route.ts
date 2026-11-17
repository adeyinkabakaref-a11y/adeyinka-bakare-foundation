import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { deleteField } from "@/lib/services/forms.service";

// DELETE field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fieldId: string }> }
) {
  try {
    await requirePermission("events", "delete");
    const { fieldId } = await params;
    await deleteField(fieldId);
    return NextResponse.json({ success: true, message: "Field deleted" });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Delete field error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete field" }, { status: 500 });
  }
}
