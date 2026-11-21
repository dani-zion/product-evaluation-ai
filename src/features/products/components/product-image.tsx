"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  name: string;
  src: string | null;
  /** Sizing and framing of the image box (e.g. aspect ratio, border). */
  className?: string;
  /** "eager" for an image above the fold. */
  loading?: "lazy" | "eager";
};

/**
 * The product's image, or a placeholder when it has none or it fails to load.
 * Decorative: the product name is always shown next to it.
 */
export function ProductImage({
  name,
  src,
  className,
  loading = "lazy",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {src && !failed ? (
        // Product images come from arbitrary hosts that can't be listed in
        // next.config ahead of time, so next/image can't optimise them.
        // biome-ignore lint/performance/noImgElement: see comment above
        <img
          src={src}
          alt=""
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <ImagePlaceholder name={name} />
      )}
    </div>
  );
}

/** Plum block with the product's first letter, cropped by the bottom edge. */
export function ImagePlaceholder({ name }: { name: string }) {
  const letter = Array.from(name.trim())[0]?.toUpperCase() ?? "?";
  return (
    <div
      aria-hidden
      className="flex size-full items-end bg-[radial-gradient(120%_90%_at_100%_0%,var(--seam),var(--raised)_70%)] px-5"
    >
      <span className="font-display translate-y-[0.18em] text-[8.5rem] text-muted-foreground/45 leading-none">
        {letter}
      </span>
    </div>
  );
}
