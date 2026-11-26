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

  return data || [];
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
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function findExecutivesBySession(session: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executives")
    .select("*")
    .eq("session", session)
    .order("display_order", { ascending: true });

  if (error) throw error;

  return data;
}

export async function findCurrentExecutives() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executives")
    .select("*")
    .eq("is_current", true)
    .order("display_order", { ascending: true });

  if (error) throw error;

  return data;
}

export async function setCurrentExecutives(session: string) {
  const supabase = await createClient();

  // Set all executives to non-current
  const { error: updateError1 } = await supabase
    .from("executives")
    .update({ is_current: false })
    .neq("is_current", false);

  if (updateError1) throw updateError1;

  // Set executives for the given session as current
  const { error: updateError2 } = await supabase
    .from("executives")
    .update({ is_current: true })
    .eq("session", session);

  if (updateError2) throw updateError2;

  return await findCurrentExecutives();
}

export async function createExecutive(executiveData: ExecutiveInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executives")
    .insert(executiveData)
    .select("*");

  if (error) throw error;

  return data?.[0] || null;
}

export async function updateExecutive(id: string, executiveData: ExecutiveUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("executives")
    .update(executiveData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function deleteExecutive(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("executives").delete().eq("id", id);

  if (error) throw error;
}
