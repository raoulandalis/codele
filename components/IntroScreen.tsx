"use client";

import { useScrambleText } from "@/lib/hooks/useScrambleText";

interface IntroScreenProps {
  onPlay: () => void;
  onDirectionsClick: () => void;
}

export function IntroScreen({ onPlay, onDirectionsClick }: IntroScreenProps) {
  const { display, isScrambling } = useScrambleText("Codele");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-foreground-muted">
          Daily number crack
        </p>
        <h1
          className={`terminal-glow mt-4 text-5xl font-medium tracking-wide sm:text-6xl ${
            isScrambling ? "intro-title-scramble" : ""
          }`}
          aria-label="Codele"
        >
          <span aria-hidden="true">{display}</span>
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-foreground-muted sm:text-base">
          Guess the 5-digit code in 6 tries.
        </p>

        <button
          type="button"
          onClick={onPlay}
          className="mt-10 w-full border border-border bg-neutral-muted px-4 py-3 text-sm transition-colors hover:bg-neutral sm:text-base"
        >
          [ PLAY ]
        </button>

        <button
          type="button"
          onClick={onDirectionsClick}
          className="mt-4 text-xs text-foreground-muted underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
        >
          How to play
        </button>
      </div>
    </div>
  );
}
