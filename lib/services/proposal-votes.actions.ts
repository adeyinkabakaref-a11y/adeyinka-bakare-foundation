"use server";

import { requirePermission } from "@/lib/auth/require-permission";
import { authErrorResponse } from "@/lib/auth/auth-error";
import { proposalVoteSchema } from "@/lib/validations/proposal-votes.schema";
import { findVotesByProposalId, createVote, deleteVote } from "@/lib/repositories/proposal-votes.repository";

export async function serverGetVotesByProposalId(proposalId: string) {
  try {
    const { user } = await requirePermission("proposals", "read");
    return await findVotesByProposalId(proposalId);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverCreateVote(data: unknown, actorId: string) {
  try {
    const { user } = await requirePermission("proposals", "update");
    const validatedData = proposalVoteSchema.parse(data);
    return await createVote(validatedData);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}

export async function serverDeleteVote(id: string, actorId: string) {
  try {
    const { user } = await requirePermission("proposals", "delete");
    await deleteVote(id);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) throw denied;
    throw error;
  }
}
