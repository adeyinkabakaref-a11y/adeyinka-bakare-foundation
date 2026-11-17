"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Pencil, FileText, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/hooks/use-toast";
import {
  serverGetEventForms,
  serverCreateForm,
  serverUpdateForm,
  serverDeleteForm,
} from "@/lib/services/forms.actions";
import { serverCountFormResponses } from "@/lib/services/responses.actions";

export default function EventFormsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingForm, setEditingForm] = useState<any | null>(null);
  const [formCounts, setFormCounts] = useState<Record<string, number>>({});

  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    status: "active" as const,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [eventRes, formsRes] = await Promise.all([
        fetch(`/api/admin/events/${eventId}`).then(r => r.json()),
        serverGetEventForms(eventId),
      ]);
      setEvent(eventRes.data);
      setForms(formsRes);
      for (const f of formsRes) {
        const count = await serverCountFormResponses(f.id);
        setFormCounts((prev) => ({ ...prev, [f.id]: count }));
      }
    } catch (err) {
      console.error("Load error:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await serverCreateForm({ event_id: eventId, ...createFormData });
      toast({ title: "Success", description: "Form created successfully" });
      setShowCreate(false);
      setCreateFormData({ title: "", description: "", status: "active" });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create form" });
    }
  };

  const handleDelete = async (formId: string) => {
    try {
      await serverDeleteForm(formId);
      toast({ title: "Success", description: "Form deleted" });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete form" });
    }
  };

  const handleToggleStatus = async (form: any) => {
    try {
      const newStatus = form.status === "active" ? "inactive" : form.status === "inactive" ? "closed" : "active";
      await serverUpdateForm(form.id, { status: newStatus });
      toast({ title: "Success", description: `Form ${newStatus}` });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update form" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-maroon-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`Forms — ${event?.title || "Event"}`}
        subtitle="Create and manage registration forms for this event"
        backHref="/admin/events"
        actions={[
          { label: "New Form", onClick: () => setShowCreate(true), variant: "primary" },
        ]}
      />

      {/* Create Form Dialog */}
      {showCreate && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Create New Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="form_title">Form Title</Label>
              <Input
                id="form_title"
                value={createFormData.title}
                onChange={(e) => setCreateFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Registration Form"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form_description">Description</Label>
              <Textarea
                id="form_description"
                value={createFormData.description}
                onChange={(e) => setCreateFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description of what this form is for..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button variant="brand" onClick={handleCreate} disabled={!createFormData.title.trim()}>Create Form</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forms List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Forms ({forms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {forms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No forms created yet. Click "New Form" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {forms.map((form) => (
                <div key={form.id} className="flex items-center gap-4 rounded-xl border border-border p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{form.title}</h3>
                      <Badge variant={form.status === "active" ? "default" : "secondary"}>{form.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{form.description || "No description"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <BarChart3 className="size-4" /> {formCounts[form.id] || 0} responses
                    </span>
                    <Link
                      href={`/admin/events/${eventId}/forms/${form.id}/fields`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Pencil className="size-4" /> Fields
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(form)}
                      className="text-xs"
                    >
                      {form.status === "active" ? "Close" : "Open"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(form.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
