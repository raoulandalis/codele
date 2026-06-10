interface DigitTrackerProps {
  usedDigits: Set<number>;
}

function formatTriedDigits(usedDigits: Set<number>): string {
  if (usedDigits.size === 0) return "—";

  return [...usedDigits]
    .sort((left, right) => left - right)
    .join(" ");
}

export function DigitTracker({ usedDigits }: DigitTrackerProps) {
  const formatted = formatTriedDigits(usedDigits);

  return (
    <aside
      className="w-full max-w-[11rem] shrink-0 border border-border bg-neutral-muted px-2 py-2 font-mono text-[10px] leading-tight sm:max-w-[12rem] sm:px-3 sm:py-2.5 sm:text-xs md:w-28"
      aria-live="polite"
      aria-label={`Digits tried: ${formatted}`}
    >
      <p className="break-all text-foreground-muted">$ cat ~/tried_digits.log</p>
      <p className="mt-1.5 break-all tracking-widest text-foreground sm:mt-2">
        {formatted}
      </p>
    </aside>
  );
}
