import { createClient } from "../supabase/server";
import type { ExecutiveInsert, ExecutiveUpdate } from "../types/database.types";

/** Admin list: every status, in the order shown on the site. */
export async function findAllExecutives() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executives")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}

/** Public list. RLS already hides drafts and archived rows; the filter keeps the intent explicit. */
export async function findPublishedExecutives() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executives")
    .select("*")
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}

/** Cheap check used to decide whether the site links to the Executives page at all. */
export async function anyPublishedExecutive() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executives")
    .select("id")
    .eq("status", "published")
    .limit(1);

  if (error) throw error;

  return data.length > 0;
}

export async function findExecutiveById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executives")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createExecutive(data: ExecutiveInsert) {
  const supabase = await createClient();

  const { data: executive, error } = await supabase
    .from("executives")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return executive;
}

export async function updateExecutive(id: string, data: ExecutiveUpdate) {
  const supabase = await createClient();

  const { data: executive, error } = await supabase
    .from("executives")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return executive;
}

export async function deleteExecutive(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("executives").delete().eq("id", id);

  if (error) throw error;
}
