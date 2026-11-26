"use client";

import Image from "next/image";
import { useState } from "react";

import { SocialIcon, getSocialPlatform } from "@/components/ui/social-icon";
import { Reveal } from "@/components/public/reveal";
import { ScrollFocus } from "@/components/public/scroll-focus";
import { cn } from "@/lib/utils";

export interface PublicExecutive {
  id: string;
  full_name: string;
  position: string;
  bio: string | null;
  photo: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  session: string | null;
  is_current: boolean;
  started_at: string | null;
  ended_at: string | null;
}

interface ExecutiveCardProps {
  executive: PublicExecutive;
  /** Name and position only, for the showcase on About. The Executives page shows the bio and links too. */
  compact?: boolean;
  className?: string;
  /** Whether this card is expanded to show full details */
  expanded?: boolean;
  /** Called when the card is clicked to toggle expansion */
  onToggle?: () => void;
}

/** First letter of the first and last word of the name, ignoring punctuation. */
function initialsOf(name: string) {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}]/gu, ""))
    .filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** A wide, tall card: photo on the left, details on the right. Clickable to expand for full details. */
export function ExecutiveCard({ executive, compact = false, className, expanded = false, onToggle }: ExecutiveCardProps) {
  const links = [
    { platform: "linkedin", url: executive.linkedin_url },
    { platform: "twitter", url: executive.twitter_url },
    { platform: "instagram", url: executive.instagram_url },
  ].filter((link): link is { platform: string; url: string } => Boolean(link.url));

  return (
    <div
      className={cn(
        "flex h-full min-h-40 overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-500 hover:border-primary/30 hover:shadow-lg cursor-pointer",
        expanded && "min-h-56 lg:min-h-72",
        className
      )}
      onClick={onToggle}
    >
      <ScrollFocus className="flex h-full w-full">
        <div className="relative w-36 shrink-0 self-stretch bg-gradient-to-br from-maroon-50 via-cream to-gold-100 sm:w-40">
          {executive.photo ? (
            <Image
              src={executive.photo}
              alt={`${executive.full_name}, ${executive.position}`}
              fill
              unoptimized
              sizes="160px"
              className="object-contain transition-transform duration-700 group-hover:scale-105 group-data-[focused=true]:scale-105"
            />
          ) : (
            <div className="flex size-full min-h-36 items-center justify-center" aria-hidden>
              <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-maroon-500 to-maroon-700 text-lg font-bold tracking-wide text-white shadow-md">
                {initialsOf(executive.full_name)}
              </span>
            </div>
          )}
        </div>

        <div className="flex min-h-36 min-w-0 flex-1 flex-col justify-center p-5">
          <span className="mb-2 inline-flex w-fit max-w-full rounded-full bg-gold-300/25 px-3 py-1 text-xs font-semibold leading-snug text-gold-800">
            {executive.position}
          </span>
          <h3 className="text-xl font-semibold leading-snug text-foreground">{executive.full_name}</h3>

          {!compact && expanded && executive.bio && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{executive.bio}</p>
          )}

          {!compact && expanded && links.length > 0 && (
            <ul className="-mb-2 -ml-2.5 mt-2 flex flex-wrap" aria-label={`${executive.full_name} on social media`}>
              {links.map(({ platform, url }) => (
                <li key={platform}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`${executive.full_name} on ${getSocialPlatform(platform).label}`}
                    className="flex size-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-maroon-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                  >
                    <SocialIcon platform={platform} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!compact && expanded && executive.session && (
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium">
                {executive.session}
              </span>
              {executive.is_current && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                  Current
                </span>
              )}
            </div>
          )}

          {!compact && expanded && (executive.started_at || executive.ended_at) && (
            <div className="mt-2 text-xs text-muted-foreground">
              {executive.started_at && <span>Started: {new Date(executive.started_at).toLocaleDateString()}</span>}
              {executive.started_at && executive.ended_at && <span className="mx-2">•</span>}
              {executive.ended_at && <span>Ended: {new Date(executive.ended_at).toLocaleDateString()}</span>}
            </div>
          )}
        </div>
      </ScrollFocus>
    </div>
  );
}

/**
 * Wide cards: one per row on phones, two on tablets, two on desktop. A short
 * last row, or only a few executives, is centred instead of sitting on the left.
 */
export function ExecutiveGrid({
  executives,
  compact = false,
}: {
  executives: PublicExecutive[];
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {executives.map((executive, index) => (
        <Reveal
          key={executive.id}
          delay={(index % 3) * 0.06}
          className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(50%-0.5rem)]"
        >
          <ExecutiveCard executive={executive} compact={compact} />
        </Reveal>
      ))}
    </div>
  );
}

/**
 * Expandable grid where clicking a card expands it to show full details.
 */
export function ExpandableExecutiveGrid({
  executives,
}: {
  executives: PublicExecutive[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {executives.map((executive, index) => (
        <Reveal
          key={executive.id}
          delay={(index % 3) * 0.06}
          className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(50%-0.5rem)]"
        >
          <ExecutiveCard
            executive={executive}
            compact={false}
            expanded={expandedId === executive.id}
            onToggle={() => setExpandedId(expandedId === executive.id ? null : executive.id)}
          />
        </Reveal>
      ))}
    </div>
  );
}
