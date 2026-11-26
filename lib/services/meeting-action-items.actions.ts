"use server";

import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { meetingActionItemSchema } from "@/lib/validations/meeting-action-items.schema";
import {
  findActionItemsByMeetingId,
  createActionItem,
  updateActionItem,
  deleteActionItem
} from "@/lib/repositories/meeting-action-items.repository";

export async function serverGetActionItemsByMeetingId(meetingId: string) {
  try {
    const { user } = await requirePermission("meetings", "read");
    return await findActionItemsByMeetingId(meetingId);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverCreateActionItem(data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "update");
    const validatedData = meetingActionItemSchema.parse(data);
    return await createActionItem(validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverUpdateActionItem(id: string, data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "update");
    const validatedData = meetingActionItemSchema.partial().parse(data);
    return await updateActionItem(id, validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverDeleteActionItem(id: string, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "delete");
    await deleteActionItem(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}
