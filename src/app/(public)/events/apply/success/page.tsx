"use client";

import { CheckCircle2, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ApplySuccessPage() {
  const searchParams = useSearchParams();
  const [eventTitle, setEventTitle] = useState(searchParams.get("event") || "your event");

  useEffect(() => {
    const title = searchParams.get("event");
    if (title) setEventTitle(title);
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg">
        <CardContent className="text-center py-12">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for registering for <strong className="text-foreground">{eventTitle}</strong>. We&apos;ve received your
            application and a confirmation email has been sent to your inbox.
          </p>

          <div className="mb-8 rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground mb-2">After the event, join our community:</p>
            <a
              href="https://chat.whatsapp.com/L0I5Oj8h7Qy7K0k2rXC8zh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand/90 transition-colors"
            >
              <MessageCircle className="size-5" /> Join WhatsApp Community
            </a>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/events">
              <Button variant="outline">View All Events</Button>
            </Link>
            <Link href="/">
              <Button variant="brand">Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
