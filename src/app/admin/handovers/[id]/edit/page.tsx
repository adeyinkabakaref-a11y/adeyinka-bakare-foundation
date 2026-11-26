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
import { serverGetHandoverById, serverUpdateHandover } from "@/lib/services/handovers.actions";

const SESSIONS = [
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
  "2028/2029",
  "2029/2030",
  "2030/2031",
  "2031/2032",
  "2032/2033",
  "2033/2034",
  "2034/2035",
  "2035/2036",
  "2036/2037",
  "2037/2038",
  "2038/2039",
  "2039/2040",
];

const STATUSES = ["draft", "pending", "completed", "archived"];

export default function EditHandoverPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    session: "",
    handing_over_from: "",
    handing_over_to: "",
    handover_date: "",
    projects_summary: "",
    financial_status: "",
    contact_list: "",
    notes: "",
    status: "draft" as any,
  });

  useEffect(() => {
    loadHandover();
  }, []);

  const loadHandover = async () => {
    try {
      setLoading(true);
      const data = await serverGetHandoverById(params.id);
      if (data) {
        setFormData({
          session: data.session,
          handing_over_from: data.handing_over_from || "",
          handing_over_to: data.handing_over_to || "",
          handover_date: data.handover_date || "",
          projects_summary: data.projects_summary || "",
          financial_status: data.financial_status || "",
          contact_list: data.contact_list ? JSON.stringify(data.contact_list, null, 2) : "",
          notes: data.notes || "",
          status: data.status,
        });
      }
    } catch (error) {
      console.error("Error loading handover:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load handover" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.session) {
      toast({ variant: "destructive", title: "Error", description: "Session is required" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        contact_list: formData.contact_list ? JSON.parse(formData.contact_list) : null,
      };
      await serverUpdateHandover(params.id, payload, "current-user");
      toast({ title: "Success", description: "Handover updated successfully" });
      router.push("/admin/handovers");
    } catch (error) {
      console.error("Error updating handover:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update handover" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading handover...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Handover</h1>
        <p className="text-muted-foreground">Update handover document</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Handover Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="session">Session <span className="text-destructive">*</span></Label>
              <Select
                value={formData.session}
                onValueChange={(value) => setFormData({ ...formData, session: value })}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {SESSIONS.map((session) => (
                    <SelectItem key={session} value={session}>{session}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="handing_over_from">Handing Over From</Label>
                <Input
                  id="handing_over_from"
                  value={formData.handing_over_from}
                  onChange={(e) => setFormData({ ...formData, handing_over_from: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handing_over_to">Handing Over To</Label>
                <Input
                  id="handing_over_to"
                  value={formData.handing_over_to}
                  onChange={(e) => setFormData({ ...formData, handing_over_to: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="handover_date">Handover Date</Label>
                <Input
                  id="handover_date"
                  type="date"
                  value={formData.handover_date}
                  onChange={(e) => setFormData({ ...formData, handover_date: e.target.value })}
                  disabled={saving}
                />
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
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projects_summary">Projects Summary</Label>
              <Textarea
                id="projects_summary"
                value={formData.projects_summary}
                onChange={(e) => setFormData({ ...formData, projects_summary: e.target.value })}
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="financial_status">Financial Status</Label>
              <Textarea
                id="financial_status"
                value={formData.financial_status}
                onChange={(e) => setFormData({ ...formData, financial_status: e.target.value })}
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_list">Contact List (JSON)</Label>
              <Textarea
                id="contact_list"
                value={formData.contact_list}
                onChange={(e) => setFormData({ ...formData, contact_list: e.target.value })}
                rows={4}
                disabled={saving}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                disabled={saving}
              />
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
