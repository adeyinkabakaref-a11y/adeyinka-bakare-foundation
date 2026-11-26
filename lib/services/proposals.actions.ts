"use server";

import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { proposalSchema } from "@/lib/validations/proposals.schema";
import {
  findAllProposals,
  findProposalById,
  createProposal,
  updateProposal,
  deleteProposal
} from "@/lib/repositories/proposals.repository";
import { notifyAdmins } from "@/lib/email/admin-notifications";

export async function serverGetAllProposals() {
  try {
    const { user } = await requirePermission("proposals", "read");
    return await findAllProposals();
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverGetProposalById(id: string) {
  try {
    const { user } = await requirePermission("proposals", "read");
    return await findProposalById(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverCreateProposal(data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("proposals", "create");
    const validatedData = proposalSchema.parse(data);
    const proposal = await createProposal(validatedData);
    
    await notifyAdmins({
      title: "New Proposal Submitted",
      message: `A new proposal "${validatedData.title}" has been submitted`,
      ctaUrl: "/admin/proposals",
      ctaLabel: "View Proposals",
    });
    
    return proposal;
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverUpdateProposal(id: string, data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("proposals", "update");
    const validatedData = proposalSchema.partial().parse(data);
    return await updateProposal(id, validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverDeleteProposal(id: string, actorId: string) {
  try {
    const { user } = await requirePermission("proposals", "delete");
    await deleteProposal(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}
