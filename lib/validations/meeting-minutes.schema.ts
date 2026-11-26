import { z } from "zod";

export const meetingMinuteSchema = z.object({
  meeting_id: z.string().uuid(),
  content: z.string().min(1, "Content is required"),
  version: z.number().int().positive().optional(),
});

export type MeetingMinuteInput = z.infer<typeof meetingMinuteSchema>;
