import { z } from "zod";

export const meetingActionItemSchema = z.object({
  meeting_id: z.string().uuid(),
  description: z.string().min(1, "Description is required"),
  assignee: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
});

export type MeetingActionItemInput = z.infer<typeof meetingActionItemSchema>;
