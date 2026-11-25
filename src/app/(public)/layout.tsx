import { BackToTop } from "@/components/public/back-to-top";
import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";
import { ScrollProgress } from "@/components/public/scroll-progress";
import { Toaster } from "@/components/ui/toaster";
import { hasPublishedExecutives } from "@/lib/services/executives.service";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The Executives link only exists while there is someone to show.
  const showExecutives = await hasPublishedExecutives();

  return (
    <>
      <ScrollProgress />
      <Navbar showExecutives={showExecutives} />
      <main className="pt-[72px]">
        {children}
      </main>
      <Footer />
      <BackToTop />
      <Toaster />
    </>
  );
}
