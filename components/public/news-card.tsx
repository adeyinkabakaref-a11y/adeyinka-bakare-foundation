import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  featured?: boolean;
  published_at?: string | null;
  created_at: string;
  profiles?: { full_name?: string | null } | null;
  tags?: string[] | null;
}

interface NewsCardProps {
  news: NewsItem;
  variant?: "default" | "featured";
  index?: number;
}

function safeDate(value?: string | null) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function NewsCard({ news, variant = "default", index = 0 }: NewsCardProps) {
  const date = safeDate(news.published_at || news.created_at);
  const dateLabel = format(date, "MMM d, yyyy");
  const tags = (news.tags || []).slice(0, 2);

  if (variant === "featured") {
    return (
      <Link
        href={`/news/${news.slug}`}
        className="group relative grid overflow-hidden rounded-[1.75rem] border border-maroon-100 bg-card shadow-[0_24px_60px_-42px_rgba(59,19,20,0.6)] transition-all duration-500 hover:-translate-y-0.5 hover:border-maroon-300 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="relative min-h-[15rem] overflow-hidden bg-maroon-900 sm:min-h-[20rem] lg:min-h-[25rem]">
          {news.image ? (
            <img
              src={news.image}
              alt={news.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-maroon-500 via-maroon-700 to-maroon-900">
              <span className="font-display text-6xl font-bold text-gold-200/60">ABF</span>
            </div>
          )}
          <span className="absolute left-5 top-5 inline-flex items-center rounded-full bg-gold-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-maroon-900">
            Featured story
          </span>
        </div>

        <div className="relative flex flex-col justify-center p-6 sm:p-9 lg:p-10">
          <span
            aria-hidden
            className="absolute right-6 top-6 hidden size-16 rounded-full border border-gold-300/70 sm:block"
          />
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Calendar className="size-3.5" aria-hidden />
            <time dateTime={news.published_at || news.created_at}>{dateLabel}</time>
            {news.profiles?.full_name && (
              <>
                <span aria-hidden>·</span>
                <span className="normal-case tracking-normal">{news.profiles.full_name}</span>
              </>
            )}
          </p>
          <h2 className="mt-4 max-w-xl text-balance font-display text-3xl font-bold leading-[1.12] text-maroon-900 md:text-4xl">
            {news.title}
          </h2>
          {news.excerpt && (
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              {news.excerpt}
            </p>
          )}
          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-maroon-100 bg-maroon-50 px-3 py-1 text-[11px] font-semibold text-maroon-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-maroon-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors group-hover:bg-maroon-700">
            Read the story
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/news/${news.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-maroon-300 hover:shadow-xl before:absolute before:inset-x-6 before:top-0 before:h-0.5 before:bg-gold-300 before:opacity-70"
    >
      {news.image ? (
        <div className="aspect-[16/10] overflow-hidden bg-maroon-50">
          <img
            src={news.image}
            alt={news.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-maroon-50 via-cream to-gold-50">
          <span className="font-display text-4xl font-bold text-maroon-900/30">ABF</span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3.5" aria-hidden />
          <time dateTime={news.published_at || news.created_at}>{dateLabel}</time>
          {news.profiles?.full_name && (
            <>
              <span aria-hidden>·</span>
              <span>{news.profiles.full_name}</span>
            </>
          )}
        </div>
        <h3 className="text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-maroon-600">
          {news.title}
        </h3>
        {news.excerpt && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{news.excerpt}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-maroon-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-maroon-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-primary">
          Read more
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
      <span className="sr-only">Story {index + 1}</span>
    </Link>
  );
}
