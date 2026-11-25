"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ExecutiveForm, type ExecutiveFormValues } from "@/components/admin/forms/executive-form";
import { ErrorState } from "@/components/admin/error-state";

export default function EditExecutivePage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<ExecutiveFormValues> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExecutive = async () => {
      try {
        const res = await fetch(`/api/admin/executives/${params.id}`);
        const result = await res.json();

        if (result.success) {
          const e = result.data;
          setInitial({
            full_name: e.full_name,
            position: e.position,
            bio: e.bio ?? "",
            photo: e.photo ?? "",
            linkedin_url: e.linkedin_url ?? "",
            twitter_url: e.twitter_url ?? "",
            instagram_url: e.instagram_url ?? "",
            display_order: String(e.display_order ?? 0),
            featured: e.featured,
            status: e.status,
          });
        }
      } catch (error) {
        console.error("Failed to load executive:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExecutive();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!initial) {
    return <ErrorState title="Executive not found" description="It may have been deleted, or you may not have access." />;
  }

  return <ExecutiveForm mode="edit" initial={initial} />;
}
