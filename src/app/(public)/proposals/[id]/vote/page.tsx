"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, MinusCircle, Send, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

type Proposal = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  proposer_name: string | null;
  status: string;
  created_at: string;
};

type Executive = {
  id: string;
  full_name: string;
  position: string;
  session: string | null;
  status: string;
};

export default function ProposalVotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [selectedExecutive, setSelectedExecutive] = useState<string>("");
  const [selectedExecutiveName, setSelectedExecutiveName] = useState<string>("");
  const [vote, setVote] = useState<"approve" | "reject" | "abstain" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProposal();
    loadExecutives();
  }, []);

  const loadProposal = async () => {
    try {
      const response = await fetch(`/api/public/proposals/${params.id}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setProposal(result.data);
    } catch (error) {
      console.error("Error loading proposal:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load proposal" });
    } finally {
      setLoading(false);
    }
  };

  const loadExecutives = async () => {
    try {
      const response = await fetch("/api/public/executives");
      const result = await response.json();
      if (result.success) {
        setExecutives(result.data.filter((e: Executive) => e.status === "published"));
      }
    } catch (error) {
      console.error("Error loading executives:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vote || !selectedExecutive) {
      toast({ variant: "destructive", title: "Error", description: "Please select an executive and vote" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/public/proposals/${params.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voter_id: selectedExecutive,
          voter_name: selectedExecutiveName,
          vote,
          comment: comment.trim() || null,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast({ title: "Success", description: "Your vote has been recorded" });
      router.push("/proposals");
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to submit vote" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading proposal...</div>;
  }

  if (!proposal) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Proposal not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {proposal.proposer_name && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {proposal.proposer_name}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(proposal.created_at).toLocaleDateString()}
          </div>
          {proposal.category && (
            <div className="px-2 py-1 bg-secondary rounded-md text-xs">{proposal.category}</div>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="prose max-w-none whitespace-pre-wrap">{proposal.description}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cast Your Vote</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="executive">Select Executive <span className="text-destructive">*</span></Label>
              <Select value={selectedExecutive} onValueChange={(value) => {
                setSelectedExecutive(value);
                const exec = executives.find(e => e.id === value);
                setSelectedExecutiveName(exec?.full_name || "");
              }}>
                <SelectTrigger id="executive">
                  <SelectValue placeholder="Select your executive profile" />
                </SelectTrigger>
                <SelectContent>
                  {executives.map((exec) => (
                    <SelectItem key={exec.id} value={exec.id}>
                      {exec.full_name} - {exec.position}
                      {exec.session && <span className="text-muted-foreground ml-2">({exec.session})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select the executive you represent for this vote</p>
            </div>

            <div className="space-y-1.5">
              <Label>Your Vote <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={vote === "approve" ? "default" : "outline"}
                  onClick={() => setVote("approve")}
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Approve</span>
                </Button>
                <Button
                  type="button"
                  variant={vote === "reject" ? "default" : "outline"}
                  onClick={() => setVote("reject")}
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span>Reject</span>
                </Button>
                <Button
                  type="button"
                  variant={vote === "abstain" ? "default" : "outline"}
                  onClick={() => setVote("abstain")}
                  className="h-auto py-4 flex flex-col gap-2"
                >
                  <MinusCircle className="h-6 w-6 text-gray-600" />
                  <span>Abstain</span>
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional comments about your vote..."
                rows={4}
                className="resize-none"
              />
            </div>

            <Button type="submit" disabled={submitting || !vote || !selectedExecutive} className="w-full">
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Vote
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
