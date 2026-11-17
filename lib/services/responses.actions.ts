"use server";

import { createClient } from "../supabase/server";
import { requirePermission } from "../auth/require-permission";

export async function serverCountFormResponses(formId: string): Promise<number> {
  await requirePermission("events", "read");
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("form_responses")
    .select("*", { count: "exact", head: true })
    .eq("form_id", formId);
  if (error) throw error;
  return count ?? 0;
}

export async function serverGetEventResponses(eventId: string) {
  await requirePermission("events", "read");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("event_id", eventId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function serverDeleteResponse(responseId: string) {
  await requirePermission("events", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("form_responses").delete().eq("id", responseId);
  if (error) throw error;
}
