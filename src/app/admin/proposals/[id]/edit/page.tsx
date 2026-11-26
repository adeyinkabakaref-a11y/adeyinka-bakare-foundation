"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { serverGetProposalById, serverUpdateProposal } from "@/lib/services/proposals.actions";

const CATEGORIES = ["event", "policy", "programme", "initiative", "other"];
const STATUSES = ["proposed", "under_review", "approved", "rejected", "in_progress", "completed", "archived"];

export default function EditProposalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other" as any,
    proposer_name: "",
    proposer_email: "",
    status: "proposed" as any,
  });

  useEffect(() => {
    loadProposal();
  }, []);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const data = await serverGetProposalById(params.id);
      if (data) {
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category || "other",
          proposer_name: data.proposer_name || "",
          proposer_email: data.proposer_email || "",
          status: data.status,
        });
      }
    } catch (error) {
      console.error("Error loading proposal:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load proposal" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast({ variant: "destructive", title: "Error", description: "Title and description are required" });
      return;
    }

    setSaving(true);
    try {
      await serverUpdateProposal(params.id, formData, "current-user");
      toast({ title: "Success", description: "Proposal updated successfully" });
      router.push("/admin/proposals");
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update proposal" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading proposal...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Proposal</h1>
        <p className="text-muted-foreground">Update proposal details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proposer_name">Proposer Name</Label>
                <Input
                  id="proposer_name"
                  value={formData.proposer_name}
                  onChange={(e) => setFormData({ ...formData, proposer_name: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposer_email">Proposer Email</Label>
                <Input
                  id="proposer_email"
                  type="email"
                  value={formData.proposer_email}
                  onChange={(e) => setFormData({ ...formData, proposer_email: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} loading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
