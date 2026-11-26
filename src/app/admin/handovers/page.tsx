"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Plus, Eye, Pencil, Trash2, CheckCircle, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { GuideModal } from "@/components/admin/guide-modal";
import { toast } from "@/hooks/use-toast";
import { serverGetAllHandovers, serverDeleteHandover } from "@/lib/services/handovers.actions";

type Handover = {
  id: string;
  session: string;
  handing_over_from: string | null;
  handing_over_to: string | null;
  handover_date: string | null;
  projects_summary: string | null;
  financial_status: string | null;
  status: "draft" | "pending" | "completed" | "archived";
  created_at: string;
  handing_over_from_exec: { full_name: string } | null;
  handing_over_to_exec: { full_name: string } | null;
};

const SESSIONS = [
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
  "2028/2029",
  "2029/2030",
];

export default function HandoversPage() {
  const router = useRouter();
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadHandovers();
    // Show guide on first visit
    const hasSeenGuide = localStorage.getItem("handovers-guide-seen");
    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem("handovers-guide-seen", "true");
    }
  }, []);

  const loadHandovers = async () => {
    try {
      setLoading(true);
      const data = await serverGetAllHandovers();
      setHandovers(data);
    } catch (error) {
      console.error("Error loading handovers:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load handovers" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await serverDeleteHandover(id, "current-user");
      setHandovers((current) => current.filter((h) => h.id !== id));
      setDeleteConfirm(null);
      toast({ title: "Success", description: "Handover deleted successfully" });
    } catch (error) {
      console.error("Error deleting handover:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete handover" });
    } finally {
      setDeleting(false);
    }
  };

  const filteredHandovers = handovers.filter((h) =>
    h.session.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "archived": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Handovers</h1>
          <p className="text-muted-foreground">Session transition documentation</p>
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
          <Button onClick={() => router.push("/admin/handovers/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Handover
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by session..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading handovers...</div>
      ) : filteredHandovers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No handovers found. Create your first handover document to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredHandovers.map((handover) => (
            <Card key={handover.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{handover.session}</h3>
                      <Badge className={getStatusColor(handover.status)}>
                        {getStatusIcon(handover.status)}
                        <span className="ml-1">{handover.status}</span>
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                      {handover.handing_over_from_exec && (
                        <div>From: {handover.handing_over_from_exec.full_name}</div>
                      )}
                      {handover.handing_over_to_exec && (
                        <div>To: {handover.handing_over_to_exec.full_name}</div>
                      )}
                      {handover.handover_date && (
                        <div>Date: {new Date(handover.handover_date).toLocaleDateString()}</div>
                      )}
                    </div>
                    {handover.projects_summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{handover.projects_summary}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/handovers/${handover.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/handovers/${handover.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(handover.id)}
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
        title="Delete Handover?"
        description="This will permanently delete the handover document. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        cancelLabel="Cancel"
        loading={deleting}
      />

      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} type="handovers" />
    </div>
  );
}
