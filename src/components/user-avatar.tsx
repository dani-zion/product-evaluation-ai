import { notionists } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Marker, sage and mist from the palette in globals.css, without the "#".
const BACKGROUNDS = ["f2d46b", "8fc9a3", "a79fb5"];

type UserAvatarProps = {
  /** A stable value, such as the account id. The same seed always draws the same face. */
  seed: string;
  /** The person's name, used as the image's text alternative. */
  name: string;
  /** Width and height in pixels. */
  size?: number;
  className?: string;
};

/**
 * A DiceBear avatar generated locally as an inline SVG, so no user data is
 * sent to a third party. Works in Server and Client Components; render it on
 * the server where possible to keep the drawing code out of the browser.
 */
export function UserAvatar({
  seed,
  name,
  size = 32,
  className,
}: UserAvatarProps) {
  const src = createAvatar(notionists, {
    seed,
    size,
    backgroundColor: BACKGROUNDS,
  }).toDataUri();

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className={cn("shrink-0 rounded-full", className)}
    />
  );
}
