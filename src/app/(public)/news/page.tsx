import type { Metadata } from "next";

import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { Section, SectionHeading } from "@/components/public/section";
import { CTABanner } from "@/components/public/cta-banner";
import { NewsCard, type NewsItem } from "@/components/public/news-card";
import { EmptyState } from "@/components/admin/empty-state";

export const metadata: Metadata = {
  title: "News | Adeyinka Bakare Fellowship",
  description:
    "Read the latest announcements, programme updates, and stories from the Adeyinka Bakare Fellowship.",
};

export const dynamic = "force-dynamic";

async function getNews() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/public/news`,
      { cache: "no-store" }
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { success?: boolean; data?: NewsItem[] };
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();
  const featured = news.find((item) => item.featured) || news[0];
  const rest = (featured ? news.filter((item) => item.id !== featured.id) : news);

  return (
    <>
      <PageHero
        eyebrow="Newsroom"
        title="Stories from the fellowship"
        description="Programme highlights, scholarship updates, and the moments shaping the Adeyinka Bakare Fellowship community."
      />

      <Section className="pt-10 md:pt-14">
        {news.length === 0 ? (
          <Reveal>
            <EmptyState
              title="No news yet"
              description="We'll be sharing updates soon. Check back shortly."
            />
          </Reveal>
        ) : (
          <div className="space-y-16 md:space-y-20">
            {featured && (
              <Reveal>
                <NewsCard news={featured} variant="featured" />
              </Reveal>
            )}

            {rest.length > 0 && (
              <section aria-labelledby="latest-news-heading">
                <Reveal>
                  <div className="mb-8 flex flex-col gap-4 border-b border-maroon-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <SectionHeading
                      eyebrow="The latest"
                      title="More from ABF"
                      description="Announcements and stories from across our programmes."
                      align="left"
                      className="mb-0"
                    />
                    <p className="shrink-0 text-sm font-semibold text-muted-foreground">
                      {rest.length} {rest.length === 1 ? "story" : "stories"}
                    </p>
                  </div>
                </Reveal>
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {rest.map((item, index) => (
                    <Reveal key={item.id} delay={index * 0.06}>
                      <NewsCard news={item} index={index} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Section>

      <CTABanner
        title="Want to stay in the loop?"
        description="Subscribe to our newsletter and never miss an ABF update."
        primary={{ label: "Subscribe Now", href: "/#newsletter" }}
        secondary={{ label: "Contact ABF", href: "/contact" }}
      />
    </>
  );
}
