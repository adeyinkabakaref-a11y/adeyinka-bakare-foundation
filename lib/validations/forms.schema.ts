import { z } from "zod";

export const eventFormSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "inactive", "closed"]).optional(),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;

export const formFieldSchema = z.object({
  form_id: z.string().uuid("Invalid form ID"),
  label: z.string().min(1, "Label is required").max(200),
  field_type: z.enum(["text", "email", "phone", "number", "textarea", "select", "date", "url", "file"]),
  required: z.boolean().optional(),
  options: z.record(z.string(), z.string()).nullable().optional(),
  placeholder: z.string().nullable().optional(),
  display_order: z.number().int().optional(),
});

export type FormFieldInput = z.infer<typeof formFieldSchema>;

export const formResponseSchema = z.object({
  form_id: z.string().uuid("Invalid form ID"),
  event_id: z.string().uuid("Invalid event ID"),
  full_name: z.string().min(1, "Full name is required").max(200),
  email: z.string().email("Invalid email"),
  phone: z.string().nullable().optional(),
  responses: z.record(z.string(), z.unknown()),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});

export type FormResponseInput = z.infer<typeof formResponseSchema>;

// Dynamic form submission schema — validates based on field definitions
export function buildSubmissionSchema(fields: { label: string; field_type: string; required: boolean }[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) {
    const required = f.required;
    switch (f.field_type) {
      case "email":
        shape[f.label] = required ? z.string().email("Invalid email").min(1) : z.string().email("Invalid email").optional();
        break;
      case "number":
        shape[f.label] = required ? z.number().min(0, "Required") : z.number().optional();
        break;
      case "date":
        shape[f.label] = required ? z.string().min(1, "Required") : z.string().optional();
        break;
      case "url":
        shape[f.label] = required ? z.string().url("Invalid URL").min(1) : z.string().url("Invalid URL").optional();
        break;
      case "textarea":
        shape[f.label] = required ? z.string().min(1, "Required") : z.string().optional();
        break;
      case "phone":
        shape[f.label] = required ? z.string().min(1, "Required") : z.string().optional();
        break;
      case "select":
        shape[f.label] = required ? z.string().min(1, "Required") : z.string().optional();
        break;
      default:
        shape[f.label] = required ? z.string().min(1, "Required") : z.string().optional();
    }
  }
  return z.object(shape);
}
