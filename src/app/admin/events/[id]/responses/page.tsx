"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Mail,
  Send,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import {
  ResponsesAnalytics,
  type ResponseFormSlice,
  type ResponseTrendPoint,
} from "@/components/admin/responses-analytics";
import { useToast } from "@/hooks/use-toast";
import { formatEventDate } from "@/lib/utils/dates";
import { serverGetEventResponses, serverDeleteResponse } from "@/lib/services/responses.actions";
import { serverGetEventForms } from "@/lib/services/forms.actions";

type EventInfo = { id: string; title: string };
type FormInfo = { id: string; title: string };
type ResponseInfo = {
  id: string;
  form_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  submitted_at: string;
  responses: Record<string, unknown>;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function buildTrend(responses: ResponseInfo[]): ResponseTrendPoint[] {
  const now = new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (13 - index));
    const key = day.toISOString().slice(0, 10);
    return {
      key,
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(day),
      count: responses.filter((response) => response.submitted_at?.slice(0, 10) === key).length,
    };
  });
}

function getAnalyticsWindow() {
  const now = new Date();
  return {
    todayKey: now.toISOString().slice(0, 10),
    sevenDaysAgo: now.getTime() - 7 * 24 * 60 * 60 * 1000,
  };
}

function triggerDownload(content: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function EventResponsesPage() {
  const params = useParams();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [responses, setResponses] = useState<ResponseInfo[]>([]);
  const [forms, setForms] = useState<FormInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState("all");
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [viewingResponse, setViewingResponse] = useState<ResponseInfo | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: "", body: "" });

 const load = useCallback(async () => {
 try {
 setLoading(true);
 const [eventRes, responsesRes, formsRes] = await Promise.all([
 fetch(`/api/admin/events/${eventId}`).then((r) => r.json()),
 serverGetEventResponses(eventId),
 serverGetEventForms(eventId),
 ]);
 setEvent(eventRes.data);
 setResponses(responsesRes as ResponseInfo[]);
 setForms(formsRes as FormInfo[]);
 } catch {
 toast({ variant: "destructive", title: "Error", description: "Failed to load data" });
 } finally {
 setLoading(false);
 }
 }, [eventId, toast]);

 useEffect(() => {
 void Promise.resolve().then(load);
 }, [load]);

  const filteredResponses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return responses.filter((response) => {
      if (selectedForm !== "all" && response.form_id !== selectedForm) return false;
      if (!query) return true;
      return (
        response.full_name?.toLowerCase().includes(query) ||
        response.email?.toLowerCase().includes(query)
      );
    });
  }, [responses, searchQuery, selectedForm]);

  const analytics = useMemo(() => {
    const { todayKey, sevenDaysAgo } = getAnalyticsWindow();
    const formBreakdown: ResponseFormSlice[] = forms.map((form) => ({
      id: form.id,
      title: form.title,
      count: filteredResponses.filter((response) => response.form_id === form.id).length,
    }));

    return {
      unique: new Set(filteredResponses.map((response) => response.email)).size,
      today: filteredResponses.filter((response) => response.submitted_at?.slice(0, 10) === todayKey).length,
      lastSevenDays: filteredResponses.filter(
        (response) => new Date(response.submitted_at).getTime() >= sevenDaysAgo
      ).length,
      trend: buildTrend(filteredResponses),
      forms: formBreakdown,
    };
  }, [filteredResponses, forms]);

  const fieldNames = useMemo(() => {
    const fields = new Set<string>();
    responses.forEach((response) => Object.keys(response.responses ?? {}).forEach((key) => fields.add(key)));
    return Array.from(fields);
  }, [responses]);

  const reportRows = useMemo(
    () =>
      filteredResponses.map((response) => [
        response.full_name,
        response.email,
        response.phone || "",
        forms.find((form) => form.id === response.form_id)?.title || "Unknown form",
        formatEventDate(response.submitted_at, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        ...fieldNames.map((field) => response.responses?.[field] ?? ""),
      ]),
    [filteredResponses, fieldNames, forms]
  );

  const reportHeaders = ["Name", "Email", "Phone", "Form", "Submitted At", ...fieldNames];

  const handleDelete = async (responseId: string) => {
    try {
      await serverDeleteResponse(responseId);
      toast({ title: "Success", description: "Response deleted" });
      setSelectedResponses((previous) => {
        const next = new Set(previous);
        next.delete(responseId);
        return next;
      });
      load();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete response" });
    }
  };

  const handleExportCSV = () => {
    const exportedAt = formatEventDate(new Date().toISOString(), {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const lines = [
      csvCell("ADEYINKA BAKARE FELLOWSHIP"),
      csvCell(`${event?.title || "Event"} — Application Responses`),
      csvCell(`Exported ${exportedAt} · ${filteredResponses.length} response(s)`),
      "",
      reportHeaders.map((header) => csvCell(header.toUpperCase())).join(","),
      ...reportRows.map((row) => row.map(csvCell).join(",")),
    ];
    triggerDownload(
      `﻿${lines.join("\r\n")}`,
      "text/csv;charset=utf-8",
      `${event?.title || "responses"}_responses.csv`
    );
    toast({ title: "CSV exported", description: "Your branded report is ready." });
  };

  const handleExportStyledSheet = () => {
    const headerCells = reportHeaders
      .map(
        (header) =>
          `<th style="background:#aa322b;color:#ffffff;padding:10px;border:1px solid #7f241f;font-size:11px;letter-spacing:.08em;text-transform:uppercase;text-align:left">${escapeHtml(header)}</th>`
      )
      .join("");
    const bodyRows = reportRows
      .map(
        (row, index) =>
          `<tr style="background:${index % 2 ? "#fff9eb" : "#ffffff"}">${row
            .map(
              (cell) =>
                `<td style="padding:8px 10px;border:1px solid #eadfd2;font-size:12px;color:#2d1816;vertical-align:top">${escapeHtml(cell)}</td>`
            )
            .join("")}</tr>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>
<table><tr><td colspan="${reportHeaders.length}" style="background:#2d1816;color:#f8c84d;padding:14px;font-size:18px;font-weight:800;letter-spacing:.08em">ADEYINKA BAKARE FELLOWSHIP</td></tr>
<tr><td colspan="${reportHeaders.length}" style="background:#aa322b;color:#ffffff;padding:10px;font-size:13px;font-weight:700">${escapeHtml(event?.title || "Event")} — Application Responses</td></tr></table>
<table style="border-collapse:collapse;width:100%"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>
</body></html>`;
    triggerDownload(
      html,
      "application/vnd.ms-excel;charset=utf-8",
      `${event?.title || "responses"}_responses.xls`
    );
    toast({ title: "Styled sheet exported", description: "Open the sheet in Excel or Sheets." });
  };

  const toggleResponse = (id: string) => {
  setSelectedResponses((previous) => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
};

const handleSelectAll = () => {
    if (selectedResponses.size === filteredResponses.length) {
      setSelectedResponses(new Set());
    } else {
      setSelectedResponses(new Set(filteredResponses.map((response) => response.id)));
    }
  };

  const handleSendBulkEmail = async () => {
    const recipients = filteredResponses.filter((response) => selectedResponses.has(response.id));
    if (!recipients.length) {
      toast({ variant: "destructive", title: "Error", description: "Please select at least one recipient" });
      return;
    }

    setSendingEmail(true);
    try {
      const personalizations = Object.fromEntries(
        recipients.map((recipient) => [
          recipient.email,
          { name: recipient.full_name, email: recipient.email },
        ])
      );
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipients.map((recipient) => recipient.email),
          subject: emailForm.subject,
          html: emailForm.body.replace(/\n/g, "<br/>"),
          text: emailForm.body,
          template: "event-response-bulk",
          personalizations,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to send emails");
      }
      toast({
        title: "Emails sent",
        description: `${payload.data.sent} delivered${payload.data.failed ? `, ${payload.data.failed} failed` : ""}.`,
      });
      setEmailModalOpen(false);
      setEmailForm({ subject: "", body: "" });
      setSelectedResponses(new Set());
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-maroon-500" />
      </div>
    );
  }

  const formTitle = (formId: string) => forms.find((form) => form.id === formId)?.title || "Unknown";

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeader
        title={`Responses — ${event?.title || "Event"}`}
        subtitle={`${filteredResponses.length} application${filteredResponses.length === 1 ? "" : "s"} received`}
        backHref="/admin/events"
        actions={[
          { label: "Export CSV", icon: Download, onClick: handleExportCSV, variant: "secondary" },
          { label: "Styled Sheet", icon: FileSpreadsheet, onClick: handleExportStyledSheet, variant: "secondary" },
          { label: "Send Bulk Email", icon: Send, onClick: () => setEmailModalOpen(true), variant: "primary" },
        ]}
      />

      <ResponsesAnalytics
        total={filteredResponses.length}
        unique={analytics.unique}
        today={analytics.today}
        lastSevenDays={analytics.lastSevenDays}
        trend={analytics.trend}
        forms={analytics.forms}
      />

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col gap-3 p-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-semibold">Applications</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9 w-full text-xs sm:w-64"
            />
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="h-9 w-full text-xs sm:w-44">
                <SelectValue placeholder="All forms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All forms</SelectItem>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={selectedResponses.size === filteredResponses.length && filteredResponses.length > 0}
                onChange={handleSelectAll}
                className="size-4 accent-[var(--primary)]"
              />
              Select all ({selectedResponses.size})
            </label>
            <Badge variant="outline" className="text-[10px]">Live data</Badge>
          </div>

          {filteredResponses.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No responses found.</div>
          ) : (
            <>
 <div className="space-y-3 md:hidden">
  {filteredResponses.map((response) => (
    <div key={response.id} className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <label className="flex min-w-0 items-start gap-2">
          <input
            type="checkbox"
            checked={selectedResponses.has(response.id)}
            onChange={() => toggleResponse(response.id)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">{response.full_name}</span>
            <span className="block truncate text-xs text-muted-foreground">{response.email}</span>
          </span>
        </label>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            aria-label={`View ${response.full_name}`}
            onClick={() => setViewingResponse(response)}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-destructive"
            aria-label={`Delete ${response.full_name}`}
            onClick={() => handleDelete(response.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <Badge variant="outline" className="text-[10px]">{formTitle(response.form_id)}</Badge>
        <span>{formatEventDate(response.submitted_at, { month: "short", day: "numeric", year: "numeric" })}</span>
        {response.phone ? <span>· {response.phone}</span> : null}
      </div>
    </div>
  ))}
</div>

<div className="hidden max-h-[52vh] overflow-auto rounded-xl border border-border md:block">
  <table className="w-full text-xs sm:text-sm">
    <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
      <tr className="text-left text-muted-foreground">
        <th className="w-9 px-2 py-2.5" />
        <th className="px-2 py-2.5 font-semibold">Name</th>
        <th className="px-2 py-2.5 font-semibold">Email</th>
        <th className="hidden px-2 py-2.5 font-semibold lg:table-cell">Phone</th>
        <th className="hidden px-2 py-2.5 font-semibold lg:table-cell">Form</th>
        <th className="px-2 py-2.5 font-semibold">Submitted</th>
        <th className="px-2 py-2.5 text-right font-semibold">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredResponses.map((response) => (
        <tr key={response.id} className="border-t border-border/60 hover:bg-muted/30">
          <td className="px-2 py-2">
            <input
              type="checkbox"
              checked={selectedResponses.has(response.id)}
              onChange={() => toggleResponse(response.id)}
              className="size-4 accent-[var(--primary)]"
            />
          </td>
          <td className="px-2 py-2 font-medium text-foreground">{response.full_name}</td>
          <td className="max-w-[220px] truncate px-2 py-2 text-muted-foreground">{response.email}</td>
          <td className="hidden px-2 py-2 text-muted-foreground lg:table-cell">{response.phone || "-"}</td>
          <td className="hidden px-2 py-2 lg:table-cell">
            <Badge variant="outline" className="text-[10px]">{formTitle(response.form_id)}</Badge>
          </td>
          <td className="whitespace-nowrap px-2 py-2 text-muted-foreground">
            {formatEventDate(response.submitted_at, { month: "short", day: "numeric", year: "numeric" })}
          </td>
          <td className="px-2 py-2">
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                aria-label={`View ${response.full_name}`}
                onClick={() => setViewingResponse(response)}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0 text-destructive"
                aria-label={`Delete ${response.full_name}`}
                onClick={() => handleDelete(response.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
</>
)}
        </CardContent>
      </Card>

      <Dialog open={!!viewingResponse} onOpenChange={(open) => !open && setViewingResponse(null)}>
        <DialogContent sheet className="max-w-2xl p-0">
          <DialogHeader className="border-b border-border p-4 sm:p-5">
            <DialogTitle>Application details</DialogTitle>
          </DialogHeader>
          {viewingResponse && (
            <div className="space-y-4 p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-3 text-xs sm:gap-4 sm:text-sm">
                <div>
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Name</Label>
                  <p className="font-medium">{viewingResponse.full_name}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Email</Label>
                  <p className="break-all font-medium">{viewingResponse.email}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Phone</Label>
                  <p className="font-medium">{viewingResponse.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Form</Label>
                  <p className="font-medium">{formTitle(viewingResponse.form_id)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Submitted</Label>
                  <p className="font-medium">
                    {formatEventDate(viewingResponse.submitted_at, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div>
                <Label className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Form responses
                </Label>
                <div className="space-y-2">
                  {Object.entries(viewingResponse.responses ?? {}).map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-border/70 bg-muted/20 p-3">
                      <p className="text-xs font-semibold text-foreground">{key}</p>
                      <p className="mt-0.5 break-words text-xs text-muted-foreground">{String(value ?? "-")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent sheet className="max-w-xl p-0">
          <DialogHeader className="border-b border-border p-4 sm:p-5">
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-4" /> Send bulk email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="rounded-xl bg-maroon-50 p-3 text-xs text-maroon-900">
              {selectedResponses.size} recipient{selectedResponses.size === 1 ? "" : "s"} selected
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bulk-subject">Subject</Label>
              <Input
                id="bulk-subject"
                value={emailForm.subject}
                onChange={(event) => setEmailForm({ ...emailForm, subject: event.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bulk-body">Message</Label>
              <Textarea
                id="bulk-body"
                value={emailForm.body}
                onChange={(event) => setEmailForm({ ...emailForm, body: event.target.value })}
                placeholder="Use {name} and {email} to personalize the message."
                rows={7}
              />
              <p className="text-[11px] text-muted-foreground">
                Placeholders: {"{name}"} and {"{email}"}
              </p>
            </div>
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-card pt-3">
              <Button variant="outline" onClick={() => setEmailModalOpen(false)} disabled={sendingEmail}>
                Cancel
              </Button>
              <Button
                onClick={handleSendBulkEmail}
                disabled={sendingEmail || selectedResponses.size === 0 || !emailForm.subject.trim() || !emailForm.body.trim()}
              >
                {sendingEmail ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
                {sendingEmail ? "Sending..." : "Send emails"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
