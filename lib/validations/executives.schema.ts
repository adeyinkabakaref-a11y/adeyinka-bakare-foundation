import { z } from "zod";

const optionalUrl = z.string().url("Enter a full link, starting with https://").optional().nullable();

export const executiveSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(120),
  position: z.string().trim().min(1, "Position is required").max(120),
  bio: z.string().trim().max(1200, "Keep the bio under 1,200 characters").optional().nullable(),
  photo: optionalUrl,
  linkedin_url: optionalUrl,
  twitter_url: optionalUrl,
  instagram_url: optionalUrl,
  display_order: z.number().int().min(0).max(9999).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  session: z.string().optional().nullable(),
  is_current: z.boolean().optional(),
  started_at: z.string().optional().nullable(),
  ended_at: z.string().optional().nullable(),
});

export type ExecutiveInput = z.infer<typeof executiveSchema>;
