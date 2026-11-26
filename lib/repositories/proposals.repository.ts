import { createClient } from "../supabase/server";
import type { Database, ProposalInsert, ProposalUpdate } from "../types/database.types";

type Proposal = Database["public"]["Tables"]["proposals"]["Row"];

export async function findAllProposals() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proposals")
    .select("*, profiles(*), meetings(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function findProposalById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proposals")
    .select("*, profiles(*), meetings(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function createProposal(proposalData: ProposalInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proposals")
    .insert(proposalData)
    .select("*");

  if (error) throw error;

  return data?.[0] || null;
}

export async function updateProposal(id: string, proposalData: ProposalUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proposals")
    .update(proposalData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function deleteProposal(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("proposals").delete().eq("id", id);

  if (error) throw error;
}
