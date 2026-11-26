"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, MinusCircle, Users, BarChart3, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { serverGetProposalById } from "@/lib/services/proposals.actions";
import { serverGetVotesByProposalId } from "@/lib/services/proposal-votes.actions";

type Proposal = {
  id: string;
  title: string;
  description: string;
  category: "event" | "policy" | "programme" | "initiative" | "other" | null;
  proposer_name: string | null;
  proposer_email: string | null;
  status: "proposed" | "under_review" | "approved" | "rejected" | "in_progress" | "completed" | "archived";
  meeting_id: string | null;
  created_at: string;
  meetings: { title: string } | null;
};

type Vote = {
  id: string;
  voter_name: string | null;
  vote: "approve" | "reject" | "abstain";
  comment: string | null;
  created_at: string;
};

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProposal();
  }, []);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const data = await serverGetProposalById(params.id);
      setProposal(data);
      if (data) {
        const votesData = await serverGetVotesByProposalId(params.id);
        setVotes(votesData);
      }
    } catch (error) {
      console.error("Error loading proposal:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load proposal" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "proposed": return "bg-blue-100 text-blue-800";
      case "under_review": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-emerald-100 text-emerald-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case "approve": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "reject": return <XCircle className="h-4 w-4 text-red-600" />;
      case "abstain": return <MinusCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const approveCount = votes.filter((v) => v.vote === "approve").length;
  const rejectCount = votes.filter((v) => v.vote === "reject").length;
  const abstainCount = votes.filter((v) => v.vote === "abstain").length;
  const totalVotes = votes.length;

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading proposal...</div>;
  }

  if (!proposal) {
    return <div className="text-center py-12 text-muted-foreground">Proposal not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(proposal.status)}>{proposal.status.replace("_", " ")}</Badge>
            {proposal.category && <Badge variant="outline">{proposal.category}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/proposals/${params.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => router.push("/admin/proposals")}>Back</Button>
        </div>
      </div>

      {/* Proposal Details */}
      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose max-w-none whitespace-pre-wrap">{proposal.description}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4 border-t">
            {proposal.proposer_name && (
              <div>
                <span className="text-muted-foreground">Proposed by:</span> {proposal.proposer_name}
              </div>
            )}
            {proposal.proposer_email && (
              <div>
                <span className="text-muted-foreground">Email:</span> {proposal.proposer_email}
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Created:</span> {new Date(proposal.created_at).toLocaleDateString()}
            </div>
            {proposal.meetings && (
              <div>
                <span className="text-muted-foreground">Discussed in:</span> {proposal.meetings.title}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voting Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Voting Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {totalVotes === 0 ? (
            <p className="text-muted-foreground">No votes recorded yet.</p>
          ) : (
            <>
              {/* Vote Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-700">{approveCount}</div>
                  <div className="text-sm text-green-600">Approve</div>
                  <div className="text-xs text-green-500 mt-1">
                    {totalVotes > 0 ? `${Math.round((approveCount / totalVotes) * 100)}%` : "0%"}
                  </div>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-700">{rejectCount}</div>
                  <div className="text-sm text-red-600">Reject</div>
                  <div className="text-xs text-red-500 mt-1">
                    {totalVotes > 0 ? `${Math.round((rejectCount / totalVotes) * 100)}%` : "0%"}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <div className="text-3xl font-bold text-gray-700">{abstainCount}</div>
                  <div className="text-sm text-gray-600">Abstain</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {totalVotes > 0 ? `${Math.round((abstainCount / totalVotes) * 100)}%` : "0%"}
                  </div>
                </div>
              </div>

              {/* Individual Votes */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Individual Votes ({totalVotes})
                </h3>
                {votes.map((vote) => (
                  <div key={vote.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getVoteIcon(vote.vote)}
                          <span className="font-medium">{vote.voter_name || "Anonymous"}</span>
                        </div>
                        {vote.comment && (
                          <p className="text-sm text-muted-foreground mt-1">{vote.comment}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(vote.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Share Voting Link */}
      <Card>
        <CardHeader>
          <CardTitle>Share Voting Link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Share this link with executives to allow them to vote on this proposal:
          </p>
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}/proposals/${params.id}/vote`}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/proposals/${params.id}/vote`);
                toast({ title: "Success", description: "Link copied to clipboard" });
              }}
            >
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
