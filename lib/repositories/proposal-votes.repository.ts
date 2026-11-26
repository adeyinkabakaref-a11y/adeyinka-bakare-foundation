import { createClient } from "../supabase/server";
import type { Database, ProposalVoteInsert, ProposalVoteUpdate } from "../types/database.types";

type ProposalVote = Database["public"]["Tables"]["proposal_votes"]["Row"];

export async function findVotesByProposalId(proposalId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proposal_votes")
    .select("*, members(*)")
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}

export async function createVote(voteData: ProposalVoteInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proposal_votes")
    .insert(voteData)
    .select("*");

  if (error) throw error;

  return data?.[0] || null;
}

export async function deleteVote(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("proposal_votes").delete().eq("id", id);

  if (error) throw error;
}
