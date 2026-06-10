"use client";

import { GuessRow } from "./GuessRow";

interface DirectionsModalProps {
  onClose: () => void;
}

const EXAMPLE_GUESS = {
  value: "31492",
  greenMask: [true, false, true, false, false],
  yellowMask: [false, false, false, false, false],
  correctPositions: 2,
};

export function DirectionsModal({ onClose }: DirectionsModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm border border-border bg-background p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="terminal-glow text-sm sm:text-base">How to play</h2>
          <button
            type="button"
            onClick={onClose}
            className="border border-border px-2 py-0.5 text-xs text-foreground-muted transition-colors hover:bg-neutral-muted hover:text-foreground"
            aria-label="Close directions"
          >
            [ CLOSE ]
          </button>
        </div>

        <div className="space-y-3 border border-border bg-neutral-muted p-4 text-xs leading-relaxed text-foreground sm:text-sm">
          <p>Guess the 5-digit number in 6 tries.</p>
          <p>First digit: 1–9.</p>
          <div className="space-y-2">
            <p>
              <span className="text-success">Green</span> = correct digit and
              position. Gray = no match at this position.
            </p>
            <GuessRow
              rowNumber={1}
              guess={EXAMPLE_GUESS}
              isActive={false}
              isSubmitting={false}
            />
            <p className="text-center text-foreground-muted">
              Guess <span className="font-mono">31492</span> · answer{" "}
              <span className="font-mono">38471</span>
            </p>
          </div>
          <p>Each guess unlocks a clue. Win by getting all greens.</p>
        </div>
      </div>
    </div>
  );
}
