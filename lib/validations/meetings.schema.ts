import { z } from "zod";

export const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  meeting_date: z.string().min(1, "Meeting date is required"),
  meeting_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  meeting_type: z.enum(["general", "executive", "committee", "special"]).optional(),
  status: z.enum(["scheduled", "held", "cancelled", "postponed"]).optional(),
});

export type MeetingInput = z.infer<typeof meetingSchema>;
