"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { formatEventDate } from "@/lib/utils/dates";

interface FormField {
  id: string;
  label: string;
  field_type: "text" | "email" | "phone" | "number" | "textarea" | "select" | "date" | "url" | "file";
  required: boolean;
  options: Record<string, string> | null;
  placeholder: string | null;
  display_order: number;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string | null;
  start_at: string;
  end_at: string | null;
  image: string | null;
  president_name: string | null;
  president_image: string | null;
  whatsapp_link: string | null;
  meet_link: string | null;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Record<string, string>>({
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Load event
        const eventRes = await fetch(`/api/public/events/${slug}`);
        if (!eventRes.ok) {
          router.push("/events");
          return;
        }
        const eventData = await eventRes.json();
        if (eventData.success) {
          setEventData(eventData.data);
        }

        // Load active form and fields
        const formRes = await fetch(`/api/public/events/${slug}/apply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
        if (formRes.status === 404) {
          toast({ variant: "destructive", title: "No form available", description: "This event has no active registration form" });
          return;
        }

        // Get form fields via API
        const fieldsRes = await fetch(`/api/admin/events/${eventData.data?.id}/forms`);
        if (fieldsRes.ok) {
          const formsData = await fieldsRes.json();
          if (formsData.success && formsData.data.length > 0) {
            const formId = formsData.data[0].id;
            const fieldsRes2 = await fetch(`/api/admin/forms/${formId}/fields`);
            if (fieldsRes2.ok) {
              const fieldsData = await fieldsRes2.json();
              if (fieldsData.success) {
                setFields(fieldsData.data as FormField[]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Load error:", err);
        toast({ variant: "destructive", title: "Error", description: "Failed to load event data" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, router, toast]);

  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/public/events/${slug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error) {
          setSubmitError(data.error);
          toast({ variant: "destructive", title: "Submission failed", description: data.error });
        }
        return;
      }
      // Redirect to success page
      router.push(`/events/${slug}/apply/success`);
      router.refresh();
    } catch {
      setSubmitError("Failed to submit. Please try again.");
      toast({ variant: "destructive", title: "Error", description: "Failed to submit application" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-maroon-500" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const startDate = new Date(eventData.start_at);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Link href={`/events/${slug}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4 mr-2" /> Back to Event
          </Button>
        </Link>
      </div>

      {/* Event Info Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{eventData.title}</CardTitle>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
            {eventData.start_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" /> {formatEventDate(startDate)}
              </span>
            )}
            {eventData.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {eventData.location}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{eventData.description}</p>

          {/* President Section */}
          {(eventData.president_name || eventData.president_image) && (
            <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
              {eventData.president_image && (
                <img
                  src={eventData.president_image}
                  alt={eventData.president_name || "President"}
                  className="size-16 rounded-full object-cover border-2 border-border"
                />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Fellowship President</p>
                <p className="text-lg font-semibold text-foreground">{eventData.president_name || "President"}</p>
              </div>
            </div>
          )}

          {/* Google Meet Link */}
          {eventData.meet_link && (
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">Join Online</p>
              <a
                href={eventData.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-white font-semibold hover:bg-brand/90 transition-colors"
              >
                <Calendar className="size-4" /> Join Google Meet
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Form */}
      {fields.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Register Your Interest</CardTitle>
            <p className="text-sm text-muted-foreground">Fill out the form below to register for this event.</p>
          </CardHeader>
          <CardContent>
            {submitError && (
              <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Core fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="full_name"
                    value={formValues.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    placeholder="Your full name"
                    className={errors.full_name ? "border-destructive" : ""}
                    disabled={submitting}
                  />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={formValues.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className={errors.email ? "border-destructive" : ""}
                    disabled={submitting}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formValues.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Your phone number"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Dynamic fields */}
              {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={field.label}>
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.field_type === "textarea" ? (
                    <Textarea
                      id={field.label}
                      value={formValues[field.label] || ""}
                      onChange={(e) => handleChange(field.label, e.target.value)}
                      placeholder={field.placeholder || ""}
                      rows={4}
                      disabled={submitting}
                    />
                  ) : field.field_type === "select" ? (
                    <Select
                      value={formValues[field.label] || ""}
                      onValueChange={(v) => handleChange(field.label, v)}
                      disabled={submitting}
                    >
                      <SelectTrigger id={field.label}>
                        <SelectValue placeholder={field.placeholder || "Select..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options &&
                          Object.entries(field.options).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : field.field_type === "date" ? (
                    <Input
                      id={field.label}
                      type="date"
                      value={formValues[field.label] || ""}
                      onChange={(e) => handleChange(field.label, e.target.value)}
                      disabled={submitting}
                    />
                  ) : (
                    <Input
                      id={field.label}
                      type={field.field_type === "email" ? "email" : field.field_type === "url" ? "url" : field.field_type === "number" ? "number" : field.field_type === "phone" ? "tel" : "text"}
                      value={formValues[field.label] || ""}
                      onChange={(e) => handleChange(field.label, e.target.value)}
                      placeholder={field.placeholder || ""}
                      disabled={submitting}
                    />
                  )}
                </div>
              ))}

              <Button type="submit" variant="brand" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Registration form for this event is not yet available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
