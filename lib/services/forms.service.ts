import { createClient } from "../supabase/server";
import type { Database, EventFormInsert, EventFormUpdate, FormFieldInsert, FormFieldUpdate } from "../types/database.types";
import { eventFormSchema, formFieldSchema } from "../validations/forms.schema";
import type { EventFormInput, FormFieldInput } from "../validations/forms.schema";

type EventForm = Database["public"]["Tables"]["event_forms"]["Row"];
type FormField = Database["public"]["Tables"]["form_fields"]["Row"];

export async function getEventForms(eventId: string): Promise<EventForm[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_forms")
    .select("*")
    .eq("event_id", eventId)
    .order("title", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getForm(formId: string): Promise<EventForm> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_forms")
    .select("*")
    .eq("id", formId)
    .single();
  if (error) throw error;
  return data;
}

export async function getActiveForm(eventId: string): Promise<EventForm | null> {
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

export async function createForm(input: EventFormInput): Promise<EventForm> {
  const supabase = await createClient();
  const validated = eventFormSchema.parse(input);
  const { data, error } = await supabase
    .from("event_forms")
    .insert(validated)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateForm(formId: string, input: EventFormUpdate): Promise<EventForm> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_forms")
    .update(input)
    .eq("id", formId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteForm(formId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("event_forms").delete().eq("id", formId);
  if (error) throw error;
}

export async function getFormFields(formId: string): Promise<FormField[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createField(input: FormFieldInput): Promise<FormField> {
  const supabase = await createClient();
  const validated = formFieldSchema.parse(input);
  const { data, error } = await supabase
    .from("form_fields")
    .insert(validated)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateField(fieldId: string, input: FormFieldUpdate): Promise<FormField> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_fields")
    .update(input)
    .eq("id", fieldId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteField(fieldId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("form_fields").delete().eq("id", fieldId);
  if (error) throw error;
}
