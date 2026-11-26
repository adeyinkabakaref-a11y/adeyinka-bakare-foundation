"use server";

import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { recordSchema } from "@/lib/validations/records.schema";
import {
  findAllRecords,
  findRecordById,
  createRecord,
  updateRecord,
  deleteRecord
} from "@/lib/repositories/records.repository";
import { notifyAdmins } from "@/lib/email/admin-notifications";

export async function serverGetAllRecords() {
  try {
    const { user } = await requirePermission("records", "read");
    return await findAllRecords();
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverGetRecordById(id: string) {
  try {
    const { user } = await requirePermission("records", "read");
    return await findRecordById(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverCreateRecord(data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("records", "create");
    const validatedData = recordSchema.parse(data);
    const record = await createRecord(validatedData);
    
    await notifyAdmins({
      title: "New Record Added",
      message: `A new record "${validatedData.title}" has been added to the repository`,
      ctaUrl: "/admin/records",
      ctaLabel: "View Records",
    });
    
    return record;
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverUpdateRecord(id: string, data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("records", "update");
    const validatedData = recordSchema.partial().parse(data);
    return await updateRecord(id, validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverDeleteRecord(id: string, actorId: string) {
  try {
    const { user } = await requirePermission("records", "delete");
    await deleteRecord(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}
