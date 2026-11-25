import { NextResponse } from "next/server";
import { getPublishedExecutives } from "@/lib/services/executives.service";

// Public read: published executives only, in display order.
export async function GET() {
  try {
    const executives = await getPublishedExecutives();
    return NextResponse.json({ success: true, data: executives });
  } catch (error) {
    console.error("Get public executives error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch executives" }, { status: 500 });
  }
}
