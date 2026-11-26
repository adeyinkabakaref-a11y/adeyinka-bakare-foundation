import { z } from "zod";

export const proposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["event", "policy", "programme", "initiative", "other"]).optional(),
  proposer_name: z.string().optional().nullable(),
  proposer_email: z.string().email().optional().nullable(),
  status: z.enum(["proposed", "under_review", "approved", "rejected", "in_progress", "completed", "archived"]).optional(),
  meeting_id: z.string().uuid().optional().nullable(),
});

export type ProposalInput = z.infer<typeof proposalSchema>;
