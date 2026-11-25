"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Award } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceList } from "@/components/admin/resource-list";
import { StatusBadge, FeaturedBadge } from "@/components/admin/status-badge";
import { Toolbar } from "@/components/admin/toolbar";
import { ListSkeleton } from "@/components/admin/loading-state";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/hooks/use-toast";

interface Executive {
  id: string;
  full_name: string;
  position: string;
  photo: string | null;
  display_order: number;
  featured: boolean;
  status: "draft" | "published" | "archived";
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
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadExecutives = async () => {
      try {
        const response = await fetch("/api/admin/executives");
        const result = await response.json();

        if (!result.success) throw new Error(result.error || "Failed to load executives");
        setExecutives(result.data);
      } catch (error) {
        console.error("Error loading executives:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load executives" });
      } finally {
        setLoading(false);
      }
    };

    loadExecutives();
  }, [toast]);

  const query = searchQuery.toLowerCase();
  const filtered = executives.filter(
    (executive) =>
      executive.full_name.toLowerCase().includes(query) ||
      executive.position.toLowerCase().includes(query)
  );

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/executives/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

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
        <CardContent>
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
                        {r.featured && <FeaturedBadge />}
                      </span>
                    </div>
                  ),
                },
                { header: "Position", cell: (r) => r.position, className: "text-muted-foreground" },
                { header: "Order", cell: (r) => r.display_order, className: "text-muted-foreground" },
                { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
              ]}
              title={(r) => r.full_name}
              badges={(r) => (
                <>
                  {r.featured && <FeaturedBadge />}
                  <StatusBadge status={r.status} />
                </>
              )}
              meta={(r) => (
                <>
                  <p>{r.position}</p>
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
      />
    </div>
  );
}
