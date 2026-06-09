import { getUsedDigits } from "@/lib/game/digitFeedback";
import type { StoredGuess } from "@/lib/game/types";

interface DigitTrackerProps {
  guesses: StoredGuess[];
}

export function DigitTracker({ guesses }: DigitTrackerProps) {
  const usedDigits = getUsedDigits(guesses);

  return (
    <div className="flex w-full max-w-xl flex-wrap justify-center gap-2 px-4 pb-2">
      {Array.from({ length: 10 }, (_, digit) => (
        <div
          key={digit}
          className={`flex h-10 w-10 items-center justify-center rounded-md border font-mono text-sm transition-colors ${
            usedDigits.has(digit)
              ? "border-border/50 bg-neutral-muted/30 text-foreground/25"
              : "border-border bg-neutral-muted text-foreground/80"
          }`}
          aria-label={`Digit ${digit}${usedDigits.has(digit) ? ", used" : ""}`}
        >
          {digit}
        </div>
      ))}
    </div>
  );
}
