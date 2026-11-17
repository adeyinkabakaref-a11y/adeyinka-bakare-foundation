"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, FileText, BarChart3, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/hooks/use-toast";
import { getEventForms, createForm } from "@/lib/services/forms.service";
import { createClient } from "@/lib/supabase/server";
import { countFormResponses } from "@/lib/services/responses.service";

export default function FormsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({ event_id: "", title: "", description: "", status: "active" as const });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
  try {
    setLoading(true);
    const supabase = await createClient();
    const [{ data: evts }, fms] = await Promise.all([
      supabase.from("events").select("*").order("title", { ascending: true }),
      getEventForms("placeholder"),
    ]);

    setEvents(evts || []);
    setForms(fms || []);

    for (const f of (fms || [])) {
      const count = await countFormResponses(f.id);
      setCounts((prev) => ({ ...prev, [f.id]: count }));
    }
  } catch (err) {
    console.error("Load error:", err);
    toast({ variant: "destructive", title: "Error", description: "Failed to load data" });
  } finally {
    setLoading(false);
  }
};

const handleCreate = async () => {
    if (!createData.event_id || !createData.title.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Event and title are required" });
      return;
    }
    try {
      await createForm({ ...createData });
      toast({ title: "Success", description: "Form created successfully" });
      setShowCreate(false);
      setCreateData({ event_id: "", title: "", description: "", status: "active" });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create form" });
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
      <PageHeader title="All Forms" subtitle="Manage registration forms across all events" />

      {showCreate && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-lg">Create New Form</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="event_id">Event</Label>
              <select
                id="event_id"
                value={createData.event_id}
                onChange={(e) => setCreateData((p) => ({ ...p, event_id: e.target.value }))}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="">Select event...</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Form Title</Label>
              <Input
                value={createData.title}
                onChange={(e) => setCreateData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Registration Form"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button variant="brand" onClick={handleCreate} disabled={!createData.event_id || !createData.title.trim()}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {events.length === 0 && forms.length === 0 && (
        <Card className="border-border">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No events or forms found. Create an event first, then add a form.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.map((evt) => {
          const eventForms = forms.filter((f) => f.event_id === evt.id);
          const totalResponses = eventForms.reduce((sum, f) => sum + (counts[f.id] || 0), 0);
          return (
            <Card key={evt.id} className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{evt.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {eventForms.length} form{eventForms.length !== 1 ? "s" : ""} · {totalResponses} total responses
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => setShowCreate(true)}
                    >
                      <Plus className="size-4 mr-2" /> Add Form
                    </Button>
                    <Link href={`/admin/events/${evt.id}/responses`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="size-4 mr-1" /> Responses
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {eventForms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No forms yet. Click "Add Form" to create one.</p>
                ) : (
                  <div className="space-y-2">
                    {eventForms.map((form) => (
                      <div key={form.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{form.title}</div>
                            <div className="text-xs text-muted-foreground">{form.status} · {counts[form.id] || 0} responses</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/events/${evt.id}/forms/${form.id}/fields`}>
                            <Button variant="ghost" size="sm">Manage Fields</Button>
                          </Link>
                          <Link href={`/admin/events/${evt.id}/responses`}>
                            <Button variant="ghost" size="sm">View Responses</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
