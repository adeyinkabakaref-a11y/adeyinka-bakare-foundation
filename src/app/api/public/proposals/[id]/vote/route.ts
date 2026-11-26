import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { voter_id, voter_name, vote, comment } = body;

  if (!voter_id || !vote) {
    return NextResponse.json({ success: false, error: "voter_id and vote are required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Check if proposal exists and is published
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (proposalError || !proposal) {
    return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 });
  }

  // Check if already voted
  const { data: existingVote, error: checkError } = await supabase
    .from("proposal_votes")
    .select("*")
    .eq("proposal_id", id)
    .eq("voter_id", voter_id)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json({ success: false, error: checkError.message }, { status: 500 });
  }

  if (existingVote) {
    return NextResponse.json({ success: false, error: "You have already voted on this proposal" }, { status: 409 });
  }

  // Create vote
  const { data: voteData, error: voteError } = await supabase
    .from("proposal_votes")
    .insert({
      proposal_id: id,
      voter_id,
      voter_name,
      vote,
      comment,
    })
    .select("*");

  if (voteError) {
    return NextResponse.json({ success: false, error: voteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: voteData?.[0] });
}
