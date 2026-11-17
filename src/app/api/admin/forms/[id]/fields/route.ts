import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { getFormFields, createField, deleteField } from "@/lib/services/forms.service";

// GET fields for a form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("events", "read");
    const { id } = await params;
    const fields = await getFormFields(id);
    return NextResponse.json({ success: true, data: fields });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Get fields error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch fields" }, { status: 500 });
  }
}

// POST create field for a form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("events", "create");
    const { id } = await params;
    const body = await request.json();
    const field = await createField({ ...body, form_id: id });
    return NextResponse.json({ success: true, data: field }, { status: 201 });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Create field error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create field" },
      { status: 500 }
    );
  }
}

// DELETE field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission("events", "delete");
    const { id } = await params;
    await deleteField(id);
    return NextResponse.json({ success: true, message: "Field deleted" });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    console.error("Delete field error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete field" }, { status: 500 });
  }
}
