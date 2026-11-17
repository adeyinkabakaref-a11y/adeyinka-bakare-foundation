"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, BarChart3, ArrowRight, Download, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";

type FormResponse = Database["public"]["Tables"]["form_responses"]["Row"];
type EventForm = Database["public"]["Tables"]["event_forms"]["Row"];
type Event = Database["public"]["Tables"]["events"]["Row"];

export default function ResponsesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ events: Event[]; forms: EventForm[]; responses: FormResponse[] }>({ events: [], forms: [], responses: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const supabase = await createClient();
      const [eventsRes, formsRes, responsesRes] = await Promise.all([
        supabase.from("events").select("*").order("title", { ascending: true }),
        supabase.from("event_forms").select("*").order("title", { ascending: true }),
        supabase.from("form_responses").select("*").order("submitted_at", { ascending: false }).limit(500),
      ]);
      setData({
        events: eventsRes.data || [],
        forms: formsRes.data || [],
        responses: responsesRes.data || [],
      });
    } catch (err) {
      console.error("Load error:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.responses.filter((r) => {
    if (selectedEvent !== "all") {
      const event = data.events.find((e) => e.id === r.event_id);
      if (event?.id !== selectedEvent) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.full_name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Event", "Form", "Submitted At"];
    const rows = filtered.map((r) => {
      const event = data.events.find((e) => e.id === r.event_id);
      const form = data.forms.find((f) => f.id === r.form_id);
      return [r.full_name, r.email, r.phone || "", event?.title || "", form?.title || "", new Date(r.submitted_at).toLocaleString()];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `responses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Success", description: "CSV exported" });
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
      <PageHeader title="All Responses" subtitle={`${filtered.length} total responses across all events`} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">All Events</option>
          {data.events.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Responses</div>
            <div className="text-2xl font-bold text-foreground">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Unique Respondents</div>
            <div className="text-2xl font-bold text-foreground">{new Set(filtered.map((r) => r.email)).size}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Events with Responses</div>
            <div className="text-2xl font-bold text-foreground">{new Set(filtered.map((r) => r.event_id)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Responses Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No responses found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold">Name</th>
                    <th className="text-left py-2 px-2 font-semibold">Email</th>
                    <th className="text-left py-2 px-2 font-semibold">Phone</th>
                    <th className="text-left py-2 px-2 font-semibold">Event</th>
                    <th className="text-left py-2 px-2 font-semibold">Form</th>
                    <th className="text-left py-2 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((r) => {
                    const event = data.events.find((e) => e.id === r.event_id);
                    const form = data.forms.find((f) => f.id === r.form_id);
                    return (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-2 font-medium">{r.full_name}</td>
                        <td className="py-3 px-2 text-muted-foreground">{r.email}</td>
                        <td className="py-3 px-2 text-muted-foreground">{r.phone || "-"}</td>
                        <td className="py-3 px-2">
                          {event && (
                            <Link href={`/admin/events/${event.id}/responses`} className="text-primary hover:underline text-xs">
                              {event.title}
                            </Link>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">{form?.title || "Unknown"}</Badge>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground whitespace-nowrap text-xs">
                          {new Date(r.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length > 200 && (
                <p className="text-xs text-muted-foreground text-center pt-4">Showing 200 of {filtered.length} responses. Use filters to narrow down.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
