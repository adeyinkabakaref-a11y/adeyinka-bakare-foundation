import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional().nullable(),
  start_at: z.string().min(1, "Start date is required"),
  end_at: z.string().optional().nullable(),
  image: z.string().nullable().optional().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, { message: "Invalid URL" }),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
  meet_link: z.string().nullable().optional().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, { message: "Invalid URL" }),
  president_name: z.string().optional().nullable(),
  president_image: z.string().nullable().optional().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, { message: "Invalid URL" }),
  whatsapp_link: z.string().optional().nullable(),
  email_from_name: z.string().optional().nullable(),
});

export type EventInput = z.infer<typeof eventSchema>;
