"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRightLeft, CheckCircle, Clock, Users, Pencil, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

type Handover = {
  id: string;
  session: string;
  handing_over_from: string | null;
  handing_over_to: string | null;
  handover_date: string | null;
  projects_summary: string | null;
  financial_status: string | null;
  contact_list: any;
  notes: string | null;
  status: "draft" | "pending" | "completed" | "archived";
  created_at: string;
  handing_over_from_exec: { full_name: string; position: string } | null;
  handing_over_to_exec: { full_name: string; position: string } | null;
};

type Executive = {
  id: string;
  full_name: string;
  position: string;
  session: string | null;
  is_current: boolean;
};

export default function HandoverDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [handover, setHandover] = useState<Handover | null>(null);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHandover();
    loadExecutives();
  }, []);

  const loadHandover = async () => {
    try {
      setLoading(true);
      const data = await serverGetHandoverById(params.id);
      setHandover(data);
    } catch (error) {
      console.error("Error loading handover:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load handover" });
    } finally {
      setLoading(false);
    }
  };

  const loadExecutives = async () => {
    try {
      const response = await fetch("/api/admin/executives-simple");
      const result = await response.json();
      if (result.success) {
        setExecutives(result.data);
      }
    } catch (error) {
      console.error("Error loading executives:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!handover) return;
    setSaving(true);
    try {
      await serverUpdateHandover(params.id, { status: newStatus }, "current-user");
      setHandover({ ...handover, status: newStatus as any });
      toast({ title: "Success", description: "Status updated" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading handover...</div>;
  }

  if (!handover) {
    return <div className="text-center py-12 text-muted-foreground">Handover not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{handover.session} Handover</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(handover.status)}>
              {getStatusIcon(handover.status)}
              <span className="ml-1">{handover.status}</span>
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/handovers/${params.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => router.push("/admin/handovers")}>Back</Button>
        </div>
      </div>

      {/* Handover Details */}
      <Card>
        <CardHeader>
          <CardTitle>Handover Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Handing Over From</Label>
              <Select
                value={handover.handing_over_from || ""}
                onValueChange={async (value) => {
                  setSaving(true);
                  try {
                    await serverUpdateHandover(params.id, { handing_over_from: value }, "current-user");
                    setHandover({ ...handover, handing_over_from: value });
                    toast({ title: "Success", description: "Updated" });
                  } catch (error) {
                    toast({ variant: "destructive", title: "Error", description: "Failed to update" });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select executive" />
                </SelectTrigger>
                <SelectContent>
                  {executives.map((exec) => (
                    <SelectItem key={exec.id} value={exec.id}>
                      {exec.full_name} - {exec.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {handover.handing_over_from_exec && (
                <p className="text-sm text-muted-foreground">
                  {handover.handing_over_from_exec.full_name} - {handover.handing_over_from_exec.position}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Handing Over To</Label>
              <Select
                value={handover.handing_over_to || ""}
                onValueChange={async (value) => {
                  setSaving(true);
                  try {
                    await serverUpdateHandover(params.id, { handing_over_to: value }, "current-user");
                    setHandover({ ...handover, handing_over_to: value });
                    toast({ title: "Success", description: "Updated" });
                  } catch (error) {
                    toast({ variant: "destructive", title: "Error", description: "Failed to update" });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select executive" />
                </SelectTrigger>
                <SelectContent>
                  {executives.map((exec) => (
                    <SelectItem key={exec.id} value={exec.id}>
                      {exec.full_name} - {exec.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {handover.handing_over_to_exec && (
                <p className="text-sm text-muted-foreground">
                  {handover.handing_over_to_exec.full_name} - {handover.handing_over_to_exec.position}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Handover Date</Label>
              <Input
                type="date"
                value={handover.handover_date || ""}
                onChange={async (e) => {
                  setSaving(true);
                  try {
                    await serverUpdateHandover(params.id, { handover_date: e.target.value }, "current-user");
                    setHandover({ ...handover, handover_date: e.target.value });
                    toast({ title: "Success", description: "Updated" });
                  } catch (error) {
                    toast({ variant: "destructive", title: "Error", description: "Failed to update" });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={handover.status}
                onValueChange={handleStatusChange}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Projects Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={handover.projects_summary || ""}
            onChange={async (e) => {
              setSaving(true);
              try {
                await serverUpdateHandover(params.id, { projects_summary: e.target.value }, "current-user");
                setHandover({ ...handover, projects_summary: e.target.value });
              } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to update" });
              } finally {
                setSaving(false);
              }
            }}
            placeholder="Summary of ongoing projects and their status..."
            rows={6}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {/* Financial Status */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={handover.financial_status || ""}
            onChange={async (e) => {
              setSaving(true);
              try {
                await serverUpdateHandover(params.id, { financial_status: e.target.value }, "current-user");
                setHandover({ ...handover, financial_status: e.target.value });
              } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to update" });
              } finally {
                setSaving(false);
              }
            }}
            placeholder="Current financial status, budget, and any outstanding obligations..."
            rows={4}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {/* Contact List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contact List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={handover.contact_list ? JSON.stringify(handover.contact_list, null, 2) : ""}
            onChange={async (e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setSaving(true);
                try {
                  await serverUpdateHandover(params.id, { contact_list: parsed }, "current-user");
                  setHandover({ ...handover, contact_list: parsed });
                } catch (error) {
                  toast({ variant: "destructive", title: "Error", description: "Failed to update" });
                } finally {
                  setSaving(false);
                }
              } catch {
                // Invalid JSON, don't save
              }
            }}
            placeholder='{"external_partners": [...], "vendors": [...], "other_contacts": [...]}'
            rows={6}
            disabled={saving}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">Enter as JSON format</p>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={handover.notes || ""}
            onChange={async (e) => {
              setSaving(true);
              try {
                await serverUpdateHandover(params.id, { notes: e.target.value }, "current-user");
                setHandover({ ...handover, notes: e.target.value });
              } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to update" });
              } finally {
                setSaving(false);
              }
            }}
            placeholder="Any additional notes or instructions for the incoming team..."
            rows={4}
            disabled={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
