import Image from "next/image";

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
}

interface ExecutiveCardProps {
  executive: PublicExecutive;
  /** Name and position only, for the showcase on About. The Executives page shows the bio and links too. */
  compact?: boolean;
  className?: string;
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

/** A wide, short card: photo on the left, details on the right. */
export function ExecutiveCard({ executive, compact = false, className }: ExecutiveCardProps) {
  const links = [
    { platform: "linkedin", url: executive.linkedin_url },
    { platform: "twitter", url: executive.twitter_url },
    { platform: "instagram", url: executive.instagram_url },
  ].filter((link): link is { platform: string; url: string } => Boolean(link.url));

  return (
    <ScrollFocus
      className={cn(
        "flex h-full overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-500 hover:border-primary/30 hover:shadow-lg data-[focused=true]:border-primary/30 data-[focused=true]:shadow-lg",
        className
      )}
    >
      <div className="relative w-24 shrink-0 self-stretch bg-gradient-to-br from-maroon-50 via-cream to-gold-100 sm:w-28">
        {executive.photo ? (
          <Image
            src={executive.photo}
            alt={`${executive.full_name}, ${executive.position}`}
            fill
            unoptimized
            sizes="112px"
            className="object-cover transition-transform duration-700 group-hover:scale-105 group-data-[focused=true]:scale-105"
          />
        ) : (
          <div className="flex size-full min-h-24 items-center justify-center" aria-hidden>
            <span className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-maroon-500 to-maroon-700 text-lg font-bold tracking-wide text-white shadow-md">
              {initialsOf(executive.full_name)}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-h-24 min-w-0 flex-1 flex-col justify-center p-4">
        <span className="mb-1.5 inline-flex w-fit max-w-full rounded-full bg-gold-300/25 px-2.5 py-0.5 text-xs font-semibold leading-snug text-gold-800">
          {executive.position}
        </span>
        <h3 className="text-lg font-semibold leading-snug text-foreground">{executive.full_name}</h3>

        {!compact && executive.bio && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{executive.bio}</p>
        )}

        {!compact && links.length > 0 && (
          <ul className="-mb-2 -ml-2.5 mt-1 flex flex-wrap" aria-label={`${executive.full_name} on social media`}>
            {links.map(({ platform, url }) => (
              <li key={platform}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${executive.full_name} on ${getSocialPlatform(platform).label}`}
                  className="flex size-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-maroon-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                >
                  <SocialIcon platform={platform} className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ScrollFocus>
  );
}

/**
 * Wide cards: one per row on phones, two on tablets, three on desktop. A short
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
    <div className="flex flex-wrap justify-center gap-3">
      {executives.map((executive, index) => (
        <Reveal
          key={executive.id}
          delay={(index % 3) * 0.06}
          className="w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]"
        >
          <ExecutiveCard executive={executive} compact={compact} />
        </Reveal>
      ))}
    </div>
  );
}
