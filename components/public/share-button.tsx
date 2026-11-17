"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  eventSlug: string;
  eventTitle: string;
}

export function ShareButton({ eventSlug, eventTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${eventSlug}`;
    const shareData = { title: eventTitle, text: `Join me for ${eventTitle}`, url };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "Share this event with anyone you like." });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: "Could not copy link",
        description: url,
      });
    }
  };

  return (
    <Button type="button" variant="outline" className="h-11 w-full" onClick={handleShare}>
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "Link copied" : "Share event"}
    </Button>
  );
}
