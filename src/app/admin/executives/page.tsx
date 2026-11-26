"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Award, Users, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ResourceList } from "@/components/admin/resource-list";
import { StatusBadge, FeaturedBadge } from "@/components/admin/status-badge";
import { Toolbar } from "@/components/admin/toolbar";
import { ListSkeleton } from "@/components/admin/loading-state";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/hooks/use-toast";
import { serverGetAllExecutives, serverDeleteExecutive, serverSetCurrentExecutives } from "@/lib/services/executives.actions";

const SESSIONS = [
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
  "2028/2029",
  "2029/2030",
];

interface Executive {
  id: string;
  full_name: string;
  position: string;
  photo: string | null;
  display_order: number;
  featured: boolean;
  status: "draft" | "published" | "archived";
  session: string | null;
  is_current: boolean;
  started_at: string | null;
  ended_at: string | null;
}

function Avatar({ executive }: { executive: Executive }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-primary">
      {executive.photo ? (
        <Image
          src={executive.photo}
          alt=""
          width={44}
          height={44}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        <Award className="size-5" aria-hidden />
      )}
    </span>
  );
}

export default function AdminExecutivesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [settingCurrent, setSettingCurrent] = useState(false);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    loadExecutives();
  }, []);

  const loadExecutives = async () => {
    try {
      setLoading(true);
      const data = await serverGetAllExecutives();
      setExecutives(data);
      // Find the current session and set it as selected
      const currentSession = data.find((exec) => exec.is_current)?.session;
      if (currentSession) {
        setSelectedSession(currentSession);
      }
    } catch (error) {
      console.error("Error loading executives:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load executives" });
    } finally {
      setLoading(false);
    }
  };

  const query = searchQuery.toLowerCase();
  const filtered = executives.filter(
    (executive) =>
      executive.full_name.toLowerCase().includes(query) ||
      executive.position.toLowerCase().includes(query) ||
      (executive.session && executive.session.toLowerCase().includes(query))
  );

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await serverDeleteExecutive(id, "current-user");
      setExecutives((current) => current.filter((executive) => executive.id !== id));
      setDeleteConfirm(null);
      toast({ title: "Success", description: "Executive deleted successfully" });
    } catch (error) {
      console.error("Error deleting executive:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete executive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleSetCurrent = async () => {
    if (!selectedSession) return;
    setSettingCurrent(true);
    try {
      await serverSetCurrentExecutives(selectedSession, "current-user");
      await loadExecutives();
      setSelectedSession(null);
      toast({ title: "Success", description: `Executive team for ${selectedSession} set as current` });
    } catch (error) {
      console.error("Error setting current executives:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to set current executives" });
    } finally {
      setSettingCurrent(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Executives"
        subtitle="The people shown on the public Executives page"
        actions={[{ label: "Add Executive", onClick: () => router.push("/admin/executives/new"), variant: "primary" }]}
      />

      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle className="text-lg font-semibold text-foreground">
              All Executives ({filtered.length})
            </CardTitle>
            <Toolbar
              search={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search executives..."
              className="w-full sm:w-auto"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Management */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <label className="text-sm font-medium">Set Current Executive Team</label>
              <p className="text-xs text-muted-foreground">Select a session to set its executives as the current team</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedSession || ""}
                onChange={(e) => setSelectedSession(e.target.value || null)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select session...</option>
                {SESSIONS.map((session) => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
              <Button
                onClick={handleSetCurrent}
                disabled={!selectedSession || settingCurrent}
                loading={settingCurrent}
              >
                Set Current
              </Button>
            </div>
          </div>

          {loading ? (
            <ListSkeleton rows={4} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No executives found"
              description={searchQuery ? "Try a different search term" : "Get started by adding your first executive"}
              action={
                !searchQuery
                  ? { label: "Add Executive", onClick: () => router.push("/admin/executives/new") }
                  : undefined
              }
              icon={Award}
            />
          ) : (
            <ResourceList
              rows={filtered}
              getKey={(r) => r.id}
              getName={(r) => r.full_name}
              icon={Award}
              leading={(r) => <Avatar executive={r} />}
              columns={[
                {
                  header: "Name",
                  cell: (r) => (
                    <div className="flex items-center gap-3 font-medium text-foreground">
                      <Avatar executive={r} />
                      <span className="flex items-center gap-2">
                        {r.full_name}
                        {r.is_current && <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Current</Badge>}
                        {r.featured && <FeaturedBadge />}
                      </span>
                    </div>
                  ),
                },
                { header: "Position", cell: (r) => r.position, className: "text-muted-foreground" },
                { header: "Session", cell: (r) => r.session || "-", className: "text-muted-foreground" },
                { header: "Order", cell: (r) => r.display_order, className: "text-muted-foreground" },
                { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ]}
              title={(r) => r.full_name}
              badges={(r) => (
                <>
                  {r.is_current && <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Current</Badge>}
                  {r.featured && <FeaturedBadge />}
                  <StatusBadge status={r.status} />
                </>
              )}
              meta={(r) => (
                <>
                  <p>{r.position}</p>
                  <p>Session: {r.session || "Not set"}</p>
                  <p>Order {r.display_order}</p>
                </>
              )}
              onEdit={(r) => router.push(`/admin/executives/${r.id}/edit`)}
              onDelete={(r) => setDeleteConfirm(r.id)}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Executive?"
        description="This removes the executive from the website and the database. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        cancelLabel="Cancel"
        loading={deleting}
      />
    </div>
  );
}
