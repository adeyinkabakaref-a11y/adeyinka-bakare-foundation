import { createClient } from "../supabase/server";
import type { Database, EventFormInsert, EventFormUpdate, FormFieldInsert, FormFieldUpdate, FormResponseInsert } from "../types/database.types";

type EventForm = Database["public"]["Tables"]["event_forms"]["Row"];
type FormField = Database["public"]["Tables"]["form_fields"]["Row"];
type FormResponse = Database["public"]["Tables"]["form_responses"]["Row"];

// ---- Event Forms ----

export async function getFormsByEvent(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_forms")
    .select("*")
    .eq("event_id", eventId)
    .order("title", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getFormById(formId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_forms")
    .select("*")
    .eq("id", formId)
    .single();
  if (error) throw error;
  return data;
}

export async function getActiveFormByEvent(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_forms")
    .select("*")
    .eq("event_id", eventId)
    .eq("status", "active")
    .single();
  if (error) return null;
  return data;
}

export async function createForm(data: EventFormInsert) {
  const supabase = await createClient();
  const { data: form, error } = await supabase
    .from("event_forms")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return form;
}

export async function updateForm(formId: string, data: EventFormUpdate) {
  const supabase = await createClient();
  const { data: form, error } = await supabase
    .from("event_forms")
    .update(data)
    .eq("id", formId)
    .select()
    .single();
  if (error) throw error;
  return form;
}

export async function deleteForm(formId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("event_forms").delete().eq("id", formId);
  if (error) throw error;
}

// ---- Form Fields ----

export async function getFieldsByForm(formId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createField(data: FormFieldInsert) {
  const supabase = await createClient();
  const { data: field, error } = await supabase
    .from("form_fields")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return field;
}

export async function updateField(fieldId: string, data: FormFieldUpdate) {
  const supabase = await createClient();
  const { data: field, error } = await supabase
    .from("form_fields")
    .update(data)
    .eq("id", fieldId)
    .select()
    .single();
  if (error) throw error;
  return field;
}

export async function deleteField(fieldId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("form_fields").delete().eq("id", fieldId);
  if (error) throw error;
}

// ---- Form Responses ----

export async function getResponsesByForm(formId: string, limit = 100) {
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

export async function getResponsesByEvent(eventId: string, limit = 100) {
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

export async function getResponseById(responseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_responses")
    .select("*")
    .eq("id", responseId)
    .single();
  if (error) throw error;
  return data;
}

export async function createResponse(data: FormResponseInsert) {
  const supabase = await createClient();
  const { data: response, error } = await supabase
    .from("form_responses")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return response;
}

export async function deleteResponse(responseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("form_responses").delete().eq("id", responseId);
  if (error) throw error;
}

export async function countResponsesByForm(formId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("form_responses")
    .select("*", { count: "exact", head: true })
    .eq("form_id", formId);
  if (error) throw error;
  return count ?? 0;
}

export async function countResponsesByEvent(eventId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("form_responses")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);
  if (error) throw error;
  return count ?? 0;
}
