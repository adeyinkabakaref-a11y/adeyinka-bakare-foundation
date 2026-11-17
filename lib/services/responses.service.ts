import { createClient } from "../supabase/server";
import type { Database, FormResponseInsert } from "../types/database.types";
import { formResponseSchema } from "../validations/forms.schema";
import type { FormResponseInput } from "../validations/forms.schema";

type FormResponse = Database["public"]["Tables"]["form_responses"]["Row"];

export async function getFormResponses(formId: string, limit = 100): Promise<FormResponse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getEventResponses(eventId: string, limit = 100): Promise<FormResponse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("event_id", eventId)
    .order("submitted_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getResponse(responseId: string): Promise<FormResponse> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("id", responseId)
    .single();
  if (error) throw error;
  return data;
}

export async function createResponse(input: FormResponseInput): Promise<FormResponse> {
  const supabase = await createClient();
  const validated = formResponseSchema.parse(input);
  const { data, error } = await supabase
    .from("form_responses")
    .insert(validated)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteResponse(responseId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("form_responses").delete().eq("id", responseId);
  if (error) throw error;
}

export async function countFormResponses(formId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("form_responses")
    .select("*", { count: "exact", head: true })
    .eq("form_id", formId);
  if (error) throw error;
  return count ?? 0;
}

export async function countEventResponses(eventId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("form_responses")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);
  if (error) throw error;
  return count ?? 0;
}
