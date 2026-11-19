import type { Metadata } from "next";

import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";

import { DigestTestForm } from "./digest-test-form";

export const metadata: Metadata = {
  title: "Weekly digest test | Adeyinka Bakare Fellowship",
  description: "Private test tool for the ABF weekly digest email.",
  robots: { index: false, follow: false },
};

export default function WeeklyDigestTestPage() {
  return (
    <>
      <PageHero
        eyebrow="Digest tools"
        title="Test the weekly letter"
        description="Send the real weekly digest to one address, or preview it without sending, before enabling the live cron schedule."
      />

      <Section width="prose" className="py-12 md:py-16">
        <DigestTestForm />

        <div className="mt-8 rounded-xl border border-maroon-100 bg-maroon-50 p-5 text-sm text-muted-foreground">
          <p className="font-semibold text-primary">When you are ready to enable the cron</p>
          <p className="mt-2 break-all">
            <code>GET https://abfimpact.org/api/cron/weekly-digest?secret=YOUR_CRON_SECRET</code>
          </p>
          <p className="mt-2">Recommended schedule for cronjobs.org: <code>0 8 * * 1</code> (Mondays, 08:00 UTC).</p>
        </div>
      </Section>
    </>
  );
}
