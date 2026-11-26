import { z } from "zod";

export const handoverSchema = z.object({
  session: z.string().min(1, "Session is required"),
  handing_over_from: z.string().uuid().optional().nullable(),
  handing_over_to: z.string().uuid().optional().nullable(),
  handover_date: z.string().optional().nullable(),
  projects_summary: z.string().optional().nullable(),
  financial_status: z.string().optional().nullable(),
  contact_list: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["draft", "pending", "completed", "archived"]).optional(),
});

export type HandoverInput = z.infer<typeof handoverSchema>;
