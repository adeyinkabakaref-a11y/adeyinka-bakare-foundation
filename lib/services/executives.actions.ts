"use server";

import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { executiveSchema } from "@/lib/validations/executives.schema";
import {
  findAllExecutives,
  findExecutiveById,
  findExecutivesBySession,
  findCurrentExecutives,
  setCurrentExecutives,
  createExecutive,
  updateExecutive,
  deleteExecutive
} from "@/lib/repositories/executives.repository";
import { notifyAdmins } from "@/lib/email/admin-notifications";

export async function serverGetAllExecutives() {
  try {
    const { user } = await requirePermission("executives", "read");
    return await findAllExecutives();
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverGetExecutiveById(id: string) {
  try {
    const { user } = await requirePermission("executives", "read");
    return await findExecutiveById(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverGetExecutivesBySession(session: string) {
  try {
    const { user } = await requirePermission("executives", "read");
    return await findExecutivesBySession(session);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverGetCurrentExecutives() {
  try {
    const { user } = await requirePermission("executives", "read");
    return await findCurrentExecutives();
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverSetCurrentExecutives(session: string, actorId: string) {
  try {
    const { user } = await requirePermission("executives", "update");
    const executives = await setCurrentExecutives(session);
    
    await notifyAdmins({
      title: "Executive Team Updated",
      message: `Executive team for session "${session}" has been set as current`,
      ctaUrl: "/admin/executives",
      ctaLabel: "View Executives",
    });
    
    return executives;
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverCreateExecutive(data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("executives", "create");
    const validatedData = executiveSchema.parse(data);
    const executive = await createExecutive(validatedData);
    
    await notifyAdmins({
      title: "New Executive Added",
      message: `A new executive "${validatedData.full_name}" has been added${validatedData.session ? ` for session ${validatedData.session}` : ""}`,
      ctaUrl: "/admin/executives",
      ctaLabel: "View Executives",
    });
    
    return executive;
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverUpdateExecutive(id: string, data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("executives", "update");
    const validatedData = executiveSchema.partial().parse(data);
    return await updateExecutive(id, validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverDeleteExecutive(id: string, actorId: string) {
  try {
    const { user } = await requirePermission("executives", "delete");
    await deleteExecutive(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}
