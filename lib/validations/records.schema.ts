import { z } from "zod";

export const recordSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  category: z.enum(["meeting", "event", "decision", "policy", "financial", "communication", "handover", "other"]),
  record_date: z.string().optional().nullable(),
  file_url: z.string().url().optional().nullable(),
  content: z.string().optional().nullable(),
});

export type RecordInput = z.infer<typeof recordSchema>;
