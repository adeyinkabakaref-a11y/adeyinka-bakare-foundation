"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Plus, Eye, Pencil, Trash2, Download, FileText, Calendar, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { GuideModal } from "@/components/admin/guide-modal";
import { toast } from "@/hooks/use-toast";
import { serverGetAllRecords, serverDeleteRecord } from "@/lib/services/records.actions";

type Record = {
  id: string;
  title: string;
  description: string | null;
  category: "meeting" | "event" | "decision" | "policy" | "financial" | "communication" | "handover" | "other";
  record_date: string | null;
  file_url: string | null;
  content: string | null;
  created_at: string;
};

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadRecords();
    // Show guide on first visit
    const hasSeenGuide = localStorage.getItem("records-guide-seen");
    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem("records-guide-seen", "true");
    }
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await serverGetAllRecords();
      setRecords(data);
    } catch (error) {
      console.error("Error loading records:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load records" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await serverDeleteRecord(id, "current-user");
      setRecords((current) => current.filter((r) => r.id !== id));
      setDeleteConfirm(null);
      toast({ title: "Success", description: "Record deleted successfully" });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete record" });
    } finally {
      setDeleting(false);
    }
  };

  const filteredRecords = records.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "meeting": return "bg-blue-100 text-blue-800";
      case "event": return "bg-green-100 text-green-800";
      case "decision": return "bg-purple-100 text-purple-800";
      case "policy": return "bg-orange-100 text-orange-800";
      case "financial": return "bg-yellow-100 text-yellow-800";
      case "communication": return "bg-pink-100 text-pink-800";
      case "handover": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Records</h1>
          <p className="text-muted-foreground">Central repository for organizational documents</p>
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
          <Button onClick={() => router.push("/admin/records/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading records...</div>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No records found. Create your first record to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{record.title}</h3>
                      <Badge className={getCategoryColor(record.category)}>{record.category}</Badge>
                    </div>
                    {record.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{record.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {record.record_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(record.record_date).toLocaleDateString()}
                        </div>
                      )}
                      {record.file_url && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Has attachment
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {record.file_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(record.file_url!, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/records/${record.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/records/${record.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(record.id)}
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
        title="Delete Record?"
        description="This will permanently delete the record. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        cancelLabel="Cancel"
        loading={deleting}
      />

      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} type="records" />
    </div>
  );
}
