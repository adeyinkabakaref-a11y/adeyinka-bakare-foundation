import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import { Award } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { Section } from "@/components/public/section";
import { CTABanner } from "@/components/public/cta-banner";
import { IconTile } from "@/components/public/feature-card";
import { ExecutiveGrid } from "@/components/public/executive-card";
import { getPublishedExecutives } from "@/lib/services/executives.service";

export const metadata: Metadata = {
  title: "Executives | Adeyinka Bakare Fellowship",
  description:
    "Meet the executives who lead the Adeyinka Bakare Fellowship and serve its members in the Department of Information Technology.",
};

async function loadExecutives() {
  try {
    return await getPublishedExecutives();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error loading executives:", error);
    return [];
  }
}

export default async function ExecutivesPage() {
  const executives = await loadExecutives();

  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="Our Executives"
        description="The executive members who lead the Adeyinka Bakare Fellowship."
      />

      <Section>
        {executives.length === 0 ? (
          <Reveal>
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <IconTile className="mb-4">
                <Award aria-hidden />
              </IconTile>
              <h2 className="text-xl font-semibold text-foreground">Executives coming soon</h2>
              <p className="mt-2 text-muted-foreground">
                We are updating this page. Please check back shortly.
              </p>
            </div>
          </Reveal>
        ) : (
          <ExecutiveGrid executives={executives} />
        )}
      </Section>

      <CTABanner
        title="Want to be part of the Fellowship?"
        description="Executives are elected or appointed through screening, interview and selection. Find out how to join."
        primary={{ label: "How to join", href: "/get-involved" }}
        secondary={{ label: "About ABF", href: "/about" }}
      />
    </>
  );
}
