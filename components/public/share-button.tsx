"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  slug: string;
  title: string;
  path: "events" | "news";
  label?: string;
  className?: string;
  variant?: ButtonProps["variant"];
}

export function ShareButton({
  slug,
  title,
  path,
  label,
  className,
  variant = "outline",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isNews = path === "news";
  const defaultLabel = isNews ? "Share story" : "Share event";

  const handleShare = async () => {
    const url = `${window.location.origin}/${path}/${slug}`;
    const shareData = {
      title,
      text: isNews ? `Read ${title}` : `Join me for ${title}`,
      url,
    };

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
      toast({
        title: "Link copied",
        description: isNews
          ? "Share this story with anyone you like."
          : "Share this event with anyone you like.",
      });
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
    <Button
      type="button"
      variant={variant}
      className={cn("h-11 w-full", className)}
      onClick={handleShare}
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? "Link copied" : label || defaultLabel}
    </Button>
  );
}
