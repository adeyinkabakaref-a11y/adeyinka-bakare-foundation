import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Newspaper, Tag } from "lucide-react";
import { format } from "date-fns";

import { Reveal } from "@/components/public/reveal";
import { Section, SectionHeading } from "@/components/public/section";
import { CTABanner } from "@/components/public/cta-banner";
import { NewsCard, type NewsItem } from "@/components/public/news-card";
import { FullMediaFigure } from "@/components/public/full-media-figure";
import { ShareButton } from "@/components/public/share-button";
import { Button } from "@/components/ui/button";

interface NewsArticle extends NewsItem {
 content?: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "News Article | Adeyinka Bakare Fellowship",
      description: "Read the latest update from ABF.",
    };
  }

  const title = `${article.title} | Adeyinka Bakare Fellowship`;
  const description =
    article.excerpt ||
    "Read the latest news and updates from the Adeyinka Bakare Fellowship.";
  const ogImage = article.image ? [article.image] : ["/brand/logo.png"];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.published_at || article.created_at,
      authors: article.profiles?.full_name ? [article.profiles.full_name] : undefined,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage,
    },
  };
}

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getArticle(slug: string) {
  try {
    const response = await fetch(`${SITE_URL}/api/public/news/${slug}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { success?: boolean; data?: NewsArticle | null };
    if (!data.success || !data.data) return null;
    return data.data;
  } catch (error) {
    console.error("Error fetching news article:", error);
    return null;
  }
}

async function getAllNews() {
  try {
    const response = await fetch(`${SITE_URL}/api/public/news`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { success?: boolean; data?: NewsItem[] };
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch {
    return [];
  }
}

function articleDate(value?: string | null) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? "" : format(date, "MMMM d, yyyy");
}

function readingTimeMinutes(html: string) {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, " ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <Section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Newspaper className="mx-auto mb-4 size-12 text-maroon-500/30" />
          <h1 className="text-3xl font-bold text-foreground">Article not found</h1>
          <p className="mt-2 text-muted-foreground">
            This article may have been moved or deleted.
          </p>
          <Button asChild variant="brand" className="mt-6">
            <Link href="/news">
              <ArrowLeft className="size-4" /> Back to all news
            </Link>
          </Button>
        </div>
      </Section>
    );
  }

  const allNews = await getAllNews();
  const related = allNews.filter((item) => item.slug !== slug).slice(0, 3);
  const dateStr = article.published_at || article.created_at;
  const minutes = readingTimeMinutes(article.content || "");
  const author = article.profiles?.full_name || "Adeyinka Bakare Fellowship";
  const tags = (article.tags || []) as string[];

  return (
    <>
      <header className="relative overflow-hidden border-b border-maroon-100 bg-gradient-to-b from-maroon-50 via-cream to-cream">
        <div
          aria-hidden
          className="absolute -right-24 -top-28 size-80 rounded-full bg-gold-200/50 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 lg:px-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-maroon-200 bg-card/80 px-4 py-2 text-sm font-semibold text-maroon-700 transition-colors hover:bg-maroon-50"
          >
            <ArrowLeft className="size-4" /> Back to news
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-maroon-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-200">
                  ABF Newsroom
                </span>
                {article.featured && (
                  <span className="inline-flex items-center rounded-full bg-gold-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-maroon-900">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="mt-5 text-balance break-words font-display text-4xl font-bold leading-[1.08] text-maroon-900 sm:text-5xl lg:text-6xl">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                  {article.excerpt}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-maroon-200 pt-5 text-sm text-muted-foreground lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="flex items-center gap-2">
                <Calendar className="size-4 shrink-0 text-maroon-500" aria-hidden />
                {articleDate(dateStr)}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-maroon-500" aria-hidden />
                {minutes} min read
              </p>
              <p className="break-words font-semibold text-foreground">{author}</p>
            </div>
          </div>
        </div>
      </header>

      {article.image && (
        <div className="mx-auto mt-8 max-w-6xl px-4 sm:mt-10 sm:px-6 lg:px-8">
          <Reveal>
            <FullMediaFigure src={article.image} alt={article.title} priority />
          </Reveal>
        </div>
      )}

      <Section className="pt-12 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
          <Reveal>
            <div className="border-t-2 border-gold-300 pt-8">
              <article className="abf-prose mx-auto max-w-3xl">
                {article.content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    className="abf-prose-body"
                  />
                ) : (
                  <p className="text-muted-foreground">No content available.</p>
                )}
              </article>
            </div>
          </Reveal>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-maroon-100 bg-card/80 p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                In this story
              </p>
              <dl className="mt-4 space-y-3 border-y border-border py-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Published</dt>
                  <dd className="mt-0.5 font-semibold text-foreground">
                    {articleDate(dateStr)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reading time</dt>
                  <dd className="mt-0.5 font-semibold text-foreground">{minutes} minutes</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Author</dt>
                  <dd className="mt-0.5 break-words font-semibold text-foreground">
                    {author}
                  </dd>
                </div>
              </dl>

              {tags.length > 0 && (
                <div className="mt-5">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    <Tag className="size-3.5" aria-hidden /> Topics
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-maroon-100 bg-maroon-50 px-3 py-1 text-[11px] font-semibold text-maroon-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <ShareButton
 slug={slug}
 title={article.title}
 path="news"
 label="Share story"
 variant="brand"
 className="mt-6 justify-start"
 />
              <Button asChild variant="outline" className="mt-2 w-full justify-start">
                <Link href="/news">All news</Link>
              </Button>
            </div>
          </aside>
        </div>
      </Section>

      {related.length > 0 && (
        <Section tone="tint">
          <Reveal>
            <SectionHeading
              eyebrow="Keep Reading"
              title="More ABF News"
              description="Discover other recent announcements and stories."
              align="center"
            />
          </Reveal>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.08}>
                <NewsCard news={item} index={index} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <CTABanner
        title="Stay close to ABF"
        description="Subscribe to our newsletter for updates on programmes and scholarship opportunities."
        primary={{ label: "Subscribe Now", href: "/#newsletter" }}
        secondary={{ label: "All News", href: "/news" }}
      />
    </>
  );
}
