import { createClient } from "../supabase/server";
import type { Database, RecordInsert, RecordUpdate } from "../types/database.types";

type Record = Database["public"]["Tables"]["records"]["Row"];

export async function findAllRecords() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("records").select("*, profiles(*)").order("record_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function findRecordById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("records").select("*, profiles(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createRecord(recordData: RecordInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("records").insert(recordData).select("*");
  if (error) throw error;
  return data?.[0] || null;
}

export async function updateRecord(id: string, recordData: RecordUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("records").update(recordData).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteRecord(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("records").delete().eq("id", id);
  if (error) throw error;
}
