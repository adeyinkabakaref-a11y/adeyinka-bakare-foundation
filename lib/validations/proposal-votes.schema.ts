import { z } from "zod";

export const proposalVoteSchema = z.object({
  proposal_id: z.string().uuid(),
  voter_id: z.string().uuid(),
  voter_name: z.string().optional().nullable(),
  vote: z.enum(["approve", "reject", "abstain"]),
  comment: z.string().optional().nullable(),
});

export type ProposalVoteInput = z.infer<typeof proposalVoteSchema>;
