import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ExecutiveGrid, type PublicExecutive } from "@/components/public/executive-card";
import { Reveal } from "@/components/public/reveal";
import { Section, SectionHeading } from "@/components/public/section";
import { getFeaturedExecutives } from "@/lib/services/executives.service";

/**
 * Featured executives for the About page. Returns an empty list if the
 * database is unreachable so a public page never fails because of this block.
 */
export async function loadFeaturedExecutives(limit = 8): Promise<PublicExecutive[]> {
  try {
    const featured = await getFeaturedExecutives();
    return featured.slice(0, limit);
  } catch (error) {
    console.error("Error loading featured executives:", error);
    return [];
  }
}

interface ExecutivesShowcaseProps {
  executives: PublicExecutive[];
  id?: string;
  tone?: "default" | "tint";
}

/** Compact executive cards with a link to the full Executives page. Renders nothing when empty, so no link to the page appears either. */
export function ExecutivesShowcase({ executives, id, tone = "default" }: ExecutivesShowcaseProps) {
  if (executives.length === 0) return null;

  return (
    <Section tone={tone} id={id}>
      <Reveal>
        <SectionHeading
          eyebrow="Leadership"
          title="Meet the executives"
          description="The executive members who lead the Fellowship."
        />
      </Reveal>

      <ExecutiveGrid executives={executives} compact />

      <Reveal delay={0.2}>
        <div className="mt-10 flex justify-center">
          <Link
            href="/executives"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-primary/30 px-6 font-semibold text-primary transition-colors hover:bg-maroon-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            Meet all executives
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
