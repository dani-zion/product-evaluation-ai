import { cn } from "cn";

/**
 * Tally's robot mark. The visor is the brand's marker highlight; one eye is a
 * dot and the other a check: a robot that has read the reviews and approves.
 * Colours come from the theme tokens (paper head, marker visor, ink eyes).
 *
 * Below 24px the simplified variant is drawn (no ears or antenna stem,
 * bolder eyes) so it stays readable.
 */
export function TallyMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const simplified = size < 24;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {simplified ? (
        <>
          <circle cx="32" cy="6" r="4.5" className="fill-marker" />
          <rect
            x="6"
            y="14"
            width="52"
            height="44"
            rx="14"
            className="fill-foreground"
          />
          <rect
            x="10"
            y="25"
            width="44"
            height="18"
            rx="5"
            transform="rotate(-4 32 34)"
            className="fill-marker"
          />
          <circle cx="23" cy="34" r="4.5" className="fill-ink" />
          <path
            d="M35 33.5 L39.5 38 L46 30.5"
            fill="none"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-ink"
          />
        </>
      ) : (
        <>
          <line
            x1="32"
            y1="7"
            x2="32"
            y2="15"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-foreground"
          />
          <circle cx="32" cy="6" r="3.6" className="fill-marker" />
          <rect
            x="3"
            y="29"
            width="6"
            height="12"
            rx="2.5"
            className="fill-foreground"
          />
          <rect
            x="55"
            y="29"
            width="6"
            height="12"
            rx="2.5"
            className="fill-foreground"
          />
          <rect
            x="8"
            y="15"
            width="48"
            height="41"
            rx="13"
            className="fill-foreground"
          />
          <rect
            x="12"
            y="26"
            width="40"
            height="15"
            rx="4"
            transform="rotate(-4 32 33.5)"
            className="fill-marker"
          />
          <circle cx="23.5" cy="34" r="3.4" className="fill-ink" />
          <path
            d="M35.5 33.6 L39 37 L45 30.6"
            fill="none"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-ink"
          />
        </>
      )}
    </svg>
  );
}

const lockupSizes = {
  /** Site header. */
  md: { mark: 40, text: "text-[2rem]", gap: "gap-2.5" },
  /** Above the sign-in and sign-up forms. */
  sm: { mark: 32, text: "text-2xl", gap: "gap-2" },
} as const;

/** The mark with the "Tally" wordmark beside it. */
export function TallyLogo({
  size = "md",
  className,
}: {
  size?: keyof typeof lockupSizes;
  className?: string;
}) {
  const s = lockupSizes[size];
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <TallyMark size={s.mark} />
      <span className={cn("font-display leading-none text-foreground", s.text)}>
        Tally
      </span>
    </span>
  );
}
