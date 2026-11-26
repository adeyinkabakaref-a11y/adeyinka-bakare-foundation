import { createClient } from "../supabase/server";
import type { Database, HandoverInsert, HandoverUpdate } from "../types/database.types";

type Handover = Database["public"]["Tables"]["handovers"]["Row"];

export async function findAllHandovers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("handovers")
    .select("*, profiles(*), handing_over_from!inner(*), handing_over_to!inner(*)")
    .order("session", { ascending: false });
  if (error) throw error;
  return data;
}

export async function findHandoverById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("handovers")
    .select("*, profiles(*), handing_over_from!inner(*), handing_over_to!inner(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createHandover(handoverData: HandoverInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("handovers").insert(handoverData).select("*");
  if (error) throw error;
  return data?.[0] || null;
}

export async function updateHandover(id: string, handoverData: HandoverUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("handovers").update(handoverData).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteHandover(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("handovers").delete().eq("id", id);
  if (error) throw error;
}
