"use server";

import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { meetingSchema } from "@/lib/validations/meetings.schema";
import {
  findAllMeetings,
  findMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting
} from "@/lib/repositories/meetings.repository";
import { notifyAdmins } from "@/lib/email/admin-notifications";

export async function serverGetAllMeetings() {
  try {
    const { user } = await requirePermission("meetings", "read");
    return await findAllMeetings();
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverGetMeetingById(id: string) {
  try {
    const { user } = await requirePermission("meetings", "read");
    return await findMeetingById(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverCreateMeeting(data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "create");
    const validatedData = meetingSchema.parse(data);
    const meeting = await createMeeting(validatedData);
    
    await notifyAdmins({
      title: "New Meeting Scheduled",
      message: `A new meeting "${validatedData.title}" has been scheduled for ${validatedData.meeting_date}`,
      ctaUrl: "/admin/meetings",
      ctaLabel: "View Meetings",
    });
    
    return meeting;
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverUpdateMeeting(id: string, data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "update");
    const validatedData = meetingSchema.partial().parse(data);
    return await updateMeeting(id, validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverDeleteMeeting(id: string, actorId: string) {
  try {
    const { user } = await requirePermission("meetings", "delete");
    await deleteMeeting(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}
