"use server";

import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { meetingMinuteSchema } from "@/lib/validations/meeting-minutes.schema";
import {
  findMinutesByMeetingId,
  createMinute,
  updateMinute,
  deleteMinute
} from "@/lib/repositories/meeting-minutes.repository";

export async function serverGetMinutesByMeetingId(meetingId: string) {
  try {
    const { user } = await requirePermission("meetings", "read");
    return await findMinutesByMeetingId(meetingId);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverCreateMinute(data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "update");
    const validatedData = meetingMinuteSchema.parse(data);
    return await createMinute(validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverUpdateMinute(id: string, data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "update");
    const validatedData = meetingMinuteSchema.partial().parse(data);
    return await updateMinute(id, validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverDeleteMinute(id: string, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "delete");
    await deleteMinute(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}
