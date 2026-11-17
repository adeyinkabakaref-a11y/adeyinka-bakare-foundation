"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Video, MessageCircle, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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

interface ApplyButtonProps {
  eventSlug: string;
  eventTitle: string;
}

function fieldPlaceholder(field: FormField) {
  const fallback = field.field_type === "select" ? `Select ${field.label.toLowerCase()}` : `Enter ${field.label.toLowerCase()}`;
  const value = field.placeholder?.trim() || fallback;
  return value.length > 48 ? `${value.slice(0, 45)}…` : value;
}

export function ApplyButton({ eventSlug, eventTitle }: ApplyButtonProps) {
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  const [hasForm, setHasForm] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);


  const loadFormData = async () => {
    try {
      setFormLoading(true);
      const [eventRes, applyRes] = await Promise.all([
        fetch(`/api/public/events/${eventSlug}`),
        fetch(`/api/public/events/${eventSlug}/apply`),
      ]);

      const eventPayload = await eventRes.json();
      if (eventPayload.success) {
        setEventData(eventPayload.data);
      }

      const applyPayload = await applyRes.json();
      if (applyPayload.success) {
        setFields((applyPayload.data.fields || []) as FormField[]);
      }
    } catch (err) {
      console.error("Load error:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to load form data" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpen = () => {
    if (hasForm) {
      setSubmitted(false);
      setOpen(true);
      loadFormData();
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/public/events/${eventSlug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Submission failed", description: data.error });
        return;
      }
      setSubmitted(true);
      toast({ title: "Success", description: "Registration submitted successfully" });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit application" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormValues({});
    setOpen(false);
  };

  useEffect(() => {
  let active = true;
  fetch(`/api/public/events/${eventSlug}/apply`)
    .then((res) => { if (active) setHasForm(res.status === 200); })
    .catch(() => { if (active) setHasForm(false); })
    .finally(() => { if (active) setChecking(false); });
  return () => { active = false; };
  }, [eventSlug]);

  if (hasForm === null) {
    return (
      <Button variant="brand" disabled={checking} className="h-11 w-full">
        {checking ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Loading...
      </Button>
    );
  }

  if (!hasForm) {
    return null;
  }

  return (
    <>
      <Button variant="brand" className="h-11 w-full" onClick={handleOpen}>
        <CheckCircle2 className="mr-2 size-4" />
        Register for this event
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent sheet className="border-b-0 pb-[env(safe-area-inset-bottom)]">
          <DialogHeader className="shrink-0 gap-1 border-b border-border px-5 pb-3 pt-4 text-left sm:px-6 sm:pt-5">
            <div
              aria-hidden
              className="mx-auto mb-1 h-1 w-10 rounded-full bg-foreground/15 sm:hidden"
            />
            <DialogTitle className="break-words pr-9 text-base leading-snug sm:text-xl">
              {submitted ? "Registration successful" : `Register for ${eventTitle}`}
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                <div className="text-center">
                  <div className="mx-auto grid size-14 place-items-center rounded-full bg-green-100">
                    <CheckCircle2 className="size-7 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-foreground">You&apos;re registered</h3>
                  <p className="mt-2 break-words text-sm text-muted-foreground">
                    Thank you for registering for {eventTitle}. A confirmation email has been sent
                    to your inbox.
                  </p>
                </div>

                {eventData && (
                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="mb-2 text-sm font-semibold text-foreground">Event details</p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {eventData.start_at && (
                          <div className="flex items-start gap-2">
                            <Calendar className="mt-0.5 size-4 shrink-0" />
                            <span className="break-words">
                              {new Date(eventData.start_at).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {eventData.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 size-4 shrink-0" />
                            <span className="break-words">{eventData.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {eventData.meet_link && (
                      <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
                        <p className="text-sm font-semibold text-foreground">Join the event online</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Use the link below at the scheduled time.
                        </p>
                        <Button asChild variant="brand" className="mt-3 h-10 w-full">
                          <a href={eventData.meet_link} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-2 size-4" /> Join Google Meet
                          </a>
                        </Button>
                      </div>
                    )}

                    {eventData.whatsapp_link && (
                      <div className="rounded-xl border-2 border-gold-400 bg-gold-50 p-4">
                        <p className="text-sm font-semibold text-foreground">Join our community</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Get updates and announcements from other attendees.
                        </p>
                        <Button asChild className="mt-3 h-10 w-full bg-gold-400 text-maroon-900 hover:bg-gold-500">
                          <a href={eventData.whatsapp_link} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 size-4" /> Join WhatsApp community
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0 border-t border-border bg-card px-5 py-3 sm:px-6">
                <Button onClick={handleReset} variant="outline" className="h-11 w-full">
                  Close
                </Button>
              </div>
            </>
          ) : formLoading ? (
            <div className="flex min-h-40 flex-1 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-maroon-500" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-4">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`min-w-0 space-y-1 ${field.field_type === "textarea" ? "sm:col-span-2" : ""}`}
                    >
                      <Label
                        htmlFor={field.label}
                        className="block break-words text-xs font-medium leading-snug text-muted-foreground"
                      >
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                      </Label>
                      {field.field_type === "textarea" ? (
                        <Textarea
                          id={field.label}
                          value={formValues[field.label] || ""}
                          onChange={(e) => handleChange(field.label, e.target.value)}
                          placeholder={fieldPlaceholder(field)}
                          rows={3}
                          disabled={submitting}
                          className="min-w-0 w-full resize-none text-sm"
                        />
                      ) : field.field_type === "select" ? (
                        <Select
                          value={formValues[field.label] || ""}
                          onValueChange={(v) => handleChange(field.label, v)}
                          disabled={submitting}
                        >
                          <SelectTrigger id={field.label} className="min-w-0 w-full text-sm">
                            <SelectValue placeholder={fieldPlaceholder(field)} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options &&
                              Object.entries(field.options).map(([value, label]) => (
                                <SelectItem key={value} value={value} className="whitespace-normal break-words">
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
                          className="min-w-0 w-full text-sm"
                        />
                      ) : (
                        <Input
                          id={field.label}
                          type={
                            field.field_type === "email"
                              ? "email"
                              : field.field_type === "url"
                                ? "url"
                                : field.field_type === "number"
                                  ? "number"
                                  : field.field_type === "phone"
                                    ? "tel"
                                    : "text"
                          }
                          value={formValues[field.label] || ""}
                          onChange={(e) => handleChange(field.label, e.target.value)}
                          placeholder={fieldPlaceholder(field)}
                          disabled={submitting}
                          className="min-w-0 w-full text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="shrink-0 border-t border-border bg-card px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                    className="h-11 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" className="h-11 flex-1 sm:flex-none" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit registration"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
