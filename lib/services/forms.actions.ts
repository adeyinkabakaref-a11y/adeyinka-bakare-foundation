"use server";

import { createClient } from "../supabase/server";
import { eventFormSchema, formFieldSchema } from "../validations/forms.schema";
import { requirePermission } from "../auth/require-permission";

export async function serverGetEventForms(eventId: string) {
  await requirePermission("events", "read");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_forms")
    .select("*")
    .eq("event_id", eventId)
    .order("title", { ascending: true });
  if (error) throw error;
  return data;
}

export async function serverCreateForm(data: any) {
  await requirePermission("events", "create");
  const supabase = await createClient();
  const validated = eventFormSchema.parse(data);
  const { data: result, error } = await supabase
    .from("event_forms")
    .insert(validated)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function serverUpdateForm(formId: string, data: any) {
  await requirePermission("events", "update");
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("event_forms")
    .update(data)
    .eq("id", formId)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function serverDeleteForm(formId: string) {
  await requirePermission("events", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("event_forms").delete().eq("id", formId);
  if (error) throw error;
}

export async function serverGetFormFields(formId: string) {
  await requirePermission("events", "read");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function serverCreateField(data: any) {
  await requirePermission("events", "create");
  const supabase = await createClient();
  const validated = formFieldSchema.parse(data);
  const { data: result, error } = await supabase
    .from("form_fields")
    .insert(validated)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function serverUpdateField(fieldId: string, data: any) {
  await requirePermission("events", "update");
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("form_fields")
    .update(data)
    .eq("id", fieldId)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function serverDeleteField(fieldId: string) {
  await requirePermission("events", "delete");
  const supabase = await createClient();
  const { error } = await supabase.from("form_fields").delete().eq("id", fieldId);
  if (error) throw error;
}
