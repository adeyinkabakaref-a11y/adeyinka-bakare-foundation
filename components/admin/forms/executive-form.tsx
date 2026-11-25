"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Award, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import { PageHeader } from "@/components/admin/page-header";
import { executiveRoles } from "@/config/about";
import { useToast } from "@/hooks/use-toast";

export type ExecutiveFormValues = {
  full_name: string;
  position: string;
  bio: string;
  photo: string;
  linkedin_url: string;
  twitter_url: string;
  instagram_url: string;
  display_order: string;
  featured: boolean;
  status: "draft" | "published" | "archived";
};

const EMPTY: ExecutiveFormValues = {
  full_name: "",
  position: "",
  bio: "",
  photo: "",
  linkedin_url: "",
  twitter_url: "",
  instagram_url: "",
  display_order: "0",
  featured: false,
  status: "draft",
};

const BIO_LIMIT = 1200;

export function ExecutiveForm({
  mode = "create",
  initial,
}: {
  mode?: "create" | "edit";
  initial?: Partial<ExecutiveFormValues>;
}) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ExecutiveFormValues>({ ...EMPTY, ...initial });

  const setField = <K extends keyof ExecutiveFormValues>(field: K, value: ExecutiveFormValues[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.full_name.trim()) next.full_name = "Full name is required";
    if (!formData.position.trim()) next.position = "Position is required";
    const order = Number(formData.display_order);
    if (!Number.isInteger(order) || order < 0) next.display_order = "Use a whole number, 0 or higher";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        position: formData.position.trim(),
        bio: formData.bio.trim() || null,
        photo: formData.photo.trim() || null,
        linkedin_url: formData.linkedin_url.trim() || null,
        twitter_url: formData.twitter_url.trim() || null,
        instagram_url: formData.instagram_url.trim() || null,
        display_order: Number(formData.display_order),
        featured: formData.featured,
        status: formData.status,
      };

      const url = mode === "edit" ? `/api/admin/executives/${params.id}` : "/api/admin/executives";
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save executive");

      toast({ title: "Success", description: mode === "edit" ? "Executive updated" : "Executive created" });
      router.push("/admin/executives");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save executive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={mode === "edit" ? "Edit Executive" : "Add New Executive"}
        subtitle={mode === "edit" ? "Update how this executive appears on the website" : "Add someone to the Executives page"}
        backHref="/admin/executives"
      />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Award className="size-4 text-primary" />
            Executive Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                  placeholder="Enter full name"
                  className={`border-border ${errors.full_name ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="position">Position <span className="text-destructive">*</span></Label>
                <Input
                  id="position"
                  list="executive-positions"
                  value={formData.position}
                  onChange={(e) => setField("position", e.target.value)}
                  placeholder="e.g., President"
                  className={`border-border ${errors.position ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                <datalist id="executive-positions">
                  {executiveRoles.map((role) => (
                    <option key={role.id} value={role.title} />
                  ))}
                </datalist>
                {errors.position && <p className="text-xs text-destructive">{errors.position}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={formData.display_order}
                  onChange={(e) => setField("display_order", e.target.value)}
                  className={`border-border ${errors.display_order ? "border-destructive" : ""}`}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first. Use 0 for the President, 1 for the next, and so on.</p>
                {errors.display_order && <p className="text-xs text-destructive">{errors.display_order}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setField("status", value as ExecutiveFormValues["status"])} disabled={loading}>
                  <SelectTrigger id="status" className="border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (hidden)</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived (hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ImageUpload
              value={formData.photo}
              onChange={(value) => setField("photo", value)}
              label="Photo"
              resource="executives"
              maxSize={5 * 1024 * 1024}
              accept="image/jpeg,image/png,image/webp"
            />

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setField("bio", e.target.value)}
                placeholder="A short introduction shown on the executive's card"
                rows={4}
                maxLength={BIO_LIMIT}
                className="resize-none border-border"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">{formData.bio.length}/{BIO_LIMIT}</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input id="linkedin_url" type="url" value={formData.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/…" className="border-border" disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="twitter_url">X (Twitter)</Label>
                <Input id="twitter_url" type="url" value={formData.twitter_url} onChange={(e) => setField("twitter_url", e.target.value)} placeholder="https://x.com/…" className="border-border" disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input id="instagram_url" type="url" value={formData.instagram_url} onChange={(e) => setField("instagram_url", e.target.value)} placeholder="https://instagram.com/…" className="border-border" disabled={loading} />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-4">
              <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => setField("featured", checked)} disabled={loading} />
              <div>
                <Label htmlFor="featured" className="cursor-pointer text-foreground">Show on Home and About</Label>
                <p className="text-xs text-muted-foreground">Featured executives appear in the showcase on those pages. Everyone published appears on the Executives page.</p>
              </div>
            </div>

            <div className="mt-2 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="h-11 w-full sm:h-10 sm:w-auto">
                Cancel
              </Button>
              <Button variant="brand" type="submit" disabled={loading} className="h-11 w-full sm:h-10 sm:w-auto">
                {loading ? (
                  <><Loader2 className="size-4 animate-spin" /> Saving…</>
                ) : mode === "edit" ? (
                  "Save Changes"
                ) : (
                  "Create Executive"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
