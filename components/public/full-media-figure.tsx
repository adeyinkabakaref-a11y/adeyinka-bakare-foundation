import { cn } from "@/lib/utils";

interface FullMediaFigureProps {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Displays a CMS supplied image in full, without cropping it to a fixed ratio.
 * The dark mat keeps transparent and pale images legible while the contained
 * image preserves whatever aspect ratio the editor uploaded.
 */
export function FullMediaFigure({
  src,
  alt,
  caption,
  priority = false,
  className,
}: FullMediaFigureProps) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-maroon-100 bg-cream p-3 shadow-[0_24px_60px_-36px_rgba(59,19,20,0.55)] sm:p-5",
        className
      )}
    >
      <div className="relative flex min-h-[16rem] items-center justify-center overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(248,200,77,0.16),transparent_58%),linear-gradient(155deg,#3b1314,#551a18)] p-2 sm:min-h-[24rem] sm:p-4">
        <img
          src={src}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          className="max-h-[58vh] w-full rounded-xl object-contain shadow-lg sm:max-h-[68vh]"
        />
      </div>
      {caption && (
        <figcaption className="flex items-center gap-3 px-2 pb-1 pt-4 text-xs text-muted-foreground sm:px-3">
          <span>{caption}</span>
          <span
            aria-hidden
            className="h-px flex-1 bg-gradient-to-r from-gold-300 to-transparent"
          />
        </figcaption>
      )}
    </figure>
  );
}
