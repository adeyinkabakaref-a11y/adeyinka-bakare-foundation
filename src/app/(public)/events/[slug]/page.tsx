import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  AlertCircle,
  MessageCircle,
  Video,
} from "lucide-react";
import {
 formatEventCalendarStamp,
 formatEventDate,
 formatEventTime,
 isEventUpcoming,
 isSameEventDay,
} from "@/lib/utils/dates";

import { Reveal } from "@/components/public/reveal";
import { Section, SectionHeading } from "@/components/public/section";
import { CTABanner } from "@/components/public/cta-banner";
import { EventCard } from "@/components/public/event-card";
import { ApplyButton } from "@/components/public/apply-button";
import { ShareButton } from "@/components/public/share-button";
import { FullMediaFigure } from "@/components/public/full-media-figure";
import { getAllEvents as fetchAllEvents, getEventBySlug } from "@/lib/services/events.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
type EventRecord = Awaited<ReturnType<typeof fetchAllEvents>>[number];

async function getEvent(slug: string) {
  try {
    const event = await getEventBySlug(slug);
    return event?.status === "published" ? event : null;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

async function getAllEvents() {
  try {
    const events = await fetchAllEvents();
    return events.filter((event) => event.status === "published");
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) {
    return {
      title: "Event | Adeyinka Bakare Fellowship",
      description: "Details of an ABF event.",
    };
  }
 const title = event.title + " | Adeyinka Bakare Fellowship";
 const description =
 event.description?.slice(0, 160) || "Join us on " + formatEventDate(event.start_at) + ".";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: event.image ? [event.image] : ["/brand/logo.png"],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return (
      <Section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-maroon-500/30" />
          <h1 className="text-3xl font-bold text-foreground">Event not found</h1>
          <p className="mt-2 text-muted-foreground">
            This event may have been moved or cancelled.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:text-maroon-700"
          >
            <ArrowLeft className="size-4" /> Back to all events
          </Link>
        </div>
      </Section>
    );
  }

  const allEvents = await getAllEvents();
 const upcoming = isEventUpcoming(event.start_at);
 const related = allEvents
 .filter((item) => item.slug !== slug && item.status === "published")
 .slice(0, 3);

 const startDate = new Date(event.start_at);
 const endDate = event.end_at ? new Date(event.end_at) : null;
 const sameDay = endDate ? isSameEventDay(startDate, endDate) : false;
 const timeLabel = formatEventTime(startDate) + (endDate ? " – " + (sameDay ? formatEventTime(endDate) : formatEventDate(endDate, { month: "short", day: "numeric" }) + " " + formatEventTime(endDate)) : "");

 const calendarParams = new URLSearchParams({
 action: "TEMPLATE",
 text: event.title,
 dates: formatEventCalendarStamp(startDate) + "/" + formatEventCalendarStamp(endDate ?? startDate),
    details: event.description || "",
    location: event.location || "",
  });
  const calendarUrl = `https://calendar.google.com/calendar/render?${calendarParams.toString()}`;

  return (
    <>
      {/* Cover */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {event.image ? (
          <>
            <img
              src={event.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-maroon-900/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-maroon-800 via-maroon-600 to-maroon-900" />
        )}

        <div className="relative mx-auto flex min-h-[380px] max-w-6xl flex-col px-4 pb-10 pt-6 sm:min-h-[440px] sm:px-6 sm:pb-14 lg:px-8">
          <div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ArrowLeft className="size-4" /> All events
            </Link>
          </div>

          <div className="mt-auto max-w-3xl pt-16">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold-300 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-maroon-900">
                {upcoming ? "Upcoming event" : "Past event"}
              </span>
              {event.meet_link && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                  <Video className="size-3.5" /> Online
                </span>
              )}
            </div>

            <h1 className="text-balance break-words text-3xl font-bold leading-[1.15] sm:text-4xl md:text-5xl">
              {event.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
              <span className="inline-flex items-center gap-2">
                <Calendar className="size-4 shrink-0 text-gold-300" />
                {formatEventDate(startDate)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-gold-300" />
                {timeLabel}
              </span>
              {event.location && (
                <span className="inline-flex max-w-full items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold-300" />
                  <span className="break-words">{event.location}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {event.image && (
 <div className="mx-auto mt-6 max-w-6xl px-4 sm:mt-8 sm:px-6 lg:px-8">
  <Reveal>
   <FullMediaFigure
    src={event.image}
    alt={`${event.title} event photograph`}
    priority
   />
  </Reveal>
 </div>
)}

 <div className="mx-auto mt-6 max-w-6xl px-4 pb-4 sm:mt-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          {/* Registration card */}
          <aside
            id="register"
            className="order-first rounded-3xl border border-maroon-100 bg-card p-5 shadow-lg shadow-maroon-900/5 sm:p-6 lg:sticky lg:top-6 lg:order-last"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Registration
              </p>
              <Badge variant={upcoming ? "default" : "muted"}>
                {upcoming ? "Open" : "Closed"}
              </Badge>
            </div>

            <div className="space-y-3 border-y border-border py-4 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 size-4 shrink-0 text-maroon-500" />
                <span className="break-words text-foreground/90">
                  {formatEventDate(startDate)}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-maroon-500" />
                <span className="break-words text-foreground/90">{timeLabel}</span>
              </div>
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-maroon-500" />
                  <span className="break-words text-foreground/90">{event.location}</span>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {upcoming && (
                <ApplyButton
                  eventSlug={event.slug}
                  eventTitle={event.title}
                />
              )}
              <Button asChild variant="outline" className="h-11 w-full">
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus className="size-4" /> Add to calendar
                </a>
              </Button>
              <ShareButton slug={event.slug} title={event.title} path="events" />
<Button asChild variant="ghost" className="h-10 w-full">
                <a href="#details">
                  Read the details <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              Register early to receive event updates and reminders.
            </p>
          </aside>

          {/* Details */}
          <div id="details" className="min-w-0 space-y-5 sm:space-y-6">
            <Reveal>
              <article className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                  About this event
                </p>
                <div className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-foreground/90 sm:text-base">
                  {event.description}
                </div>

                <div className="mt-7 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
                  <div className="rounded-2xl bg-maroon-50/70 p-4">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                      <Calendar className="size-3.5" /> Date
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold text-foreground">
                      {formatEventDate(startDate)}
                    </p>
                    {endDate && !sameDay && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Until {formatEventDate(endDate)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-gold-50/70 p-4">
                    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                      <Clock className="size-3.5" /> Time
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold text-foreground">
                      {timeLabel}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            {(event.meet_link || event.whatsapp_link) && (
              <Reveal>
                <div className="grid gap-3 sm:grid-cols-2">
                  {event.meet_link && (
                    <a
                      href={event.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-maroon-300"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-maroon-50 text-maroon-600">
                        <Video className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          Google Meet
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Join the online session
                        </span>
                      </span>
                      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                  {event.whatsapp_link && (
                    <a
                      href={event.whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-gold-300"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-600">
                        <MessageCircle className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          WhatsApp community
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Updates and announcements
                        </span>
                      </span>
                      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
              </Reveal>
            )}

            {(event.president_name || event.president_image) && (
              <Reveal>
                <div className="relative overflow-hidden rounded-3xl border border-gold-200 bg-gradient-to-br from-gold-50 via-card to-maroon-50 p-5 sm:p-6">
                  <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                    {event.president_image && (
                      <img
                        src={event.president_image}
                        alt={event.president_name || "Fellowship president"}
                        className="size-24 shrink-0 rounded-2xl object-cover shadow-md sm:size-28"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                        Fellowship president
                      </p>
                      <h2 className="mt-1 break-words text-2xl font-bold text-foreground">
                        {event.president_name || "President"}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Leading the Adeyinka Bakare Fellowship community.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <Section tone="tint">
          <Reveal>
            <SectionHeading
              eyebrow="Keep Exploring"
              title="More Events"
              description="Other upcoming and past ABF activities."
              align="center"
            />
          </Reveal>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((e: EventRecord, index: number) => (
              <Reveal key={e.id} delay={index * 0.08}>
                <EventCard event={e} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <CTABanner
        title={upcoming ? "Want to attend?" : "Discover more"}
        description={
          upcoming
            ? "Get in touch with the ABF team for registration and attendance."
            : "Check out more ABF events and join our community."
        }
        primary={{ label: "Contact ABF", href: "/contact" }}
        secondary={{ label: "All events", href: "/events" }}
      />
    </>
  );
}
