"use server";

import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { handoverSchema } from "@/lib/validations/handovers.schema";
import {
  findAllHandovers,
  findHandoverById,
  createHandover,
  updateHandover,
  deleteHandover
} from "@/lib/repositories/handovers.repository";
import { notifyAdmins } from "@/lib/email/admin-notifications";

export async function serverGetAllHandovers() {
  try {
    const { user } = await requirePermission("handovers", "read");
    return await findAllHandovers();
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverGetHandoverById(id: string) {
  try {
    const { user } = await requirePermission("handovers", "read");
    return await findHandoverById(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverCreateHandover(data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("handovers", "create");
    const validatedData = handoverSchema.parse(data);
    const handover = await createHandover(validatedData);
    
    await notifyAdmins({
      title: "New Handover Document",
      message: `A handover document for session "${validatedData.session}" has been created`,
      ctaUrl: "/admin/handovers",
      ctaLabel: "View Handovers",
    });
    
    return handover;
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverUpdateHandover(id: string, data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("handovers", "update");
    const validatedData = handoverSchema.partial().parse(data);
    const handover = await updateHandover(id, validatedData);
    
    // Notify if completed
    if (validatedData.status === "completed") {
      await notifyAdmins({
        title: "Handover Completed",
        message: `Handover for session "${handover?.session}" has been completed`,
        ctaUrl: "/admin/handovers",
        ctaLabel: "View Handovers",
      });
    }
    
    return handover;
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverDeleteHandover(id: string, actorId: string) {
  try {
    const { user } = await requirePermission("handovers", "delete");
    await deleteHandover(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}
