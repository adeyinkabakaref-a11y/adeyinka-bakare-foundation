"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { useToast } from "@/hooks/use-toast";
import { serverGetFormFields, serverCreateField, serverUpdateField, serverDeleteField } from "@/lib/services/forms.actions";

interface FormField {
  id: string;
  label: string;
  field_type: "text" | "email" | "phone" | "number" | "textarea" | "select" | "date" | "url" | "file";
  required: boolean;
  options: Record<string, string> | null;
  placeholder: string | null;
  display_order: number;
}

export default function FormFieldsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;
  const formId = params.formId as string;

  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    field_type: "text" as FormField["field_type"],
    required: false,
    placeholder: "",
    options: [] as { value: string; label: string }[],
  });

  useEffect(() => {
    load();
  }, [formId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await serverGetFormFields(formId);
      setFields(data);
    } catch (err) {
      console.error("Load error:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to load fields" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const options = formData.field_type === "select" && formData.options.length > 0
        ? formData.options.reduce((acc, opt) => {
          acc[opt.value] = opt.label;
          return acc;
        }, {} as Record<string, string>)
        : null;

      await serverCreateField({
        form_id: formId,
        label: formData.label,
        field_type: formData.field_type,
        required: formData.required,
        placeholder: formData.placeholder || null,
        options,
        display_order: fields.length,
      });

      toast({ title: "Success", description: "Field created successfully" });
      setShowCreate(false);
      setFormData({ label: "", field_type: "text", required: false, placeholder: "", options: [] });
      load();
    } catch (err) {
      console.error("Create field error:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to create field" });
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { value: "", label: "" }],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index: number, field: "value" | "label", value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const handleDelete = async (fieldId: string) => {
    try {
      await serverDeleteField(fieldId);
      toast({ title: "Success", description: "Field deleted" });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete field" });
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
        title="Form Fields"
        subtitle="Manage the fields for this registration form"
        backHref={`/admin/events/${eventId}/forms`}
        actions={[
          { label: "New Field", onClick: () => setShowCreate(true), variant: "primary" },
        ]}
      />

      {/* Create Field Dialog */}
      {showCreate && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Add New Field</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="label">Field Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))}
                placeholder="e.g., Full Name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="field_type">Field Type</Label>
              <Select
                value={formData.field_type}
                onValueChange={(value: any) => setFormData((p) => ({ ...p, field_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="select">Select (Dropdown)</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.field_type === "select" && (
              <div className="space-y-3">
                <Label>Dropdown Options</Label>
                <p className="text-xs text-muted-foreground">Add the options that will appear in the dropdown</p>
                {formData.options.map((opt, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Value (e.g., 100)"
                        value={opt.value}
                        onChange={(e) => updateOption(index, "value", e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Label (e.g., 100 Level)"
                        value={opt.label}
                        onChange={(e) => updateOption(index, "label", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="size-4 mr-2" /> Add Option
                </Button>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="placeholder">Placeholder (optional)</Label>
              <Input
                id="placeholder"
                value={formData.placeholder}
                onChange={(e) => setFormData((p) => ({ ...p, placeholder: e.target.value }))}
                placeholder="Enter placeholder text"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData((p) => ({ ...p, required: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="required">Required field</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  setFormData({ label: "", field_type: "text", required: false, placeholder: "", options: [] });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={handleCreate}
                disabled={!formData.label.trim() || (formData.field_type === "select" && formData.options.length === 0)}
              >
                Add Field
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fields List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Fields ({fields.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No fields created yet. Click "New Field" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 rounded-xl border border-border p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
                      <h3 className="font-semibold text-foreground">{field.label}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {field.field_type}
                      </span>
                      {field.required && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                          Required
                        </span>
                      )}
                    </div>
                    {field.placeholder && (
                      <p className="text-sm text-muted-foreground truncate">Placeholder: {field.placeholder}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(field.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
