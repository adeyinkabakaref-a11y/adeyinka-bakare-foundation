import { createClient } from "../supabase/server";
import type { Database, MemberInsert, MemberUpdate } from "../types/database.types";

type Member = Database["public"]["Tables"]["members"]["Row"];

export async function findAllMembers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function findMemberById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createMember(memberData: MemberInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .insert(memberData)
    .select("*");

  if (error) throw error;

  return data?.[0] || null;
}

export async function updateMember(id: string, memberData: MemberUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .update(memberData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function deleteMember(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) throw error;
}
