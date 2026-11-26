"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Plus, Eye, Pencil, Trash2, CheckCircle, XCircle, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { GuideModal } from "@/components/admin/guide-modal";
import { toast } from "@/hooks/use-toast";
import { serverGetAllProposals, serverDeleteProposal } from "@/lib/services/proposals.actions";

type Proposal = {
  id: string;
  title: string;
  description: string;
  category: "event" | "policy" | "programme" | "initiative" | "other" | null;
  proposer_name: string | null;
  proposer_email: string | null;
  status: "proposed" | "under_review" | "approved" | "rejected" | "in_progress" | "completed" | "archived";
  created_at: string;
};

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadProposals();
    // Show guide on first visit
    const hasSeenGuide = localStorage.getItem("proposals-guide-seen");
    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem("proposals-guide-seen", "true");
    }
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await serverGetAllProposals();
      setProposals(data);
    } catch (error) {
      console.error("Error loading proposals:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load proposals" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await serverDeleteProposal(id, "current-user");
      setProposals((current) => current.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      toast({ title: "Success", description: "Proposal deleted successfully" });
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete proposal" });
    } finally {
      setDeleting(false);
    }
  };

  const filteredProposals = proposals.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground">Manage and vote on proposals</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowGuide(true)}
            title="Show guide"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push("/admin/proposals/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search proposals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading proposals...</div>
      ) : filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No proposals found. Create your first proposal to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{proposal.title}</h3>
                      <Badge className={getStatusColor(proposal.status)}>
                        {getStatusIcon(proposal.status)}
                        <span className="ml-1">{proposal.status.replace("_", " ")}</span>
                      </Badge>
                      {proposal.category && (
                        <Badge variant="outline">{proposal.category}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{proposal.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {proposal.proposer_name && (
                        <div>Proposed by: {proposal.proposer_name}</div>
                      )}
                      <div>Created: {new Date(proposal.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/proposals/${proposal.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/proposals/${proposal.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(proposal.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Proposal?"
        description="This will permanently delete the proposal and all associated votes. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        cancelLabel="Cancel"
        loading={deleting}
      />

      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} type="proposals" />
    </div>
  );
}
