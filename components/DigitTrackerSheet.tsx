"use client";

import { DigitTracker } from "./DigitTracker";

interface DigitTrackerSheetProps {
  usedDigits: Set<number>;
  onClose: () => void;
}

export function DigitTrackerSheet({
  usedDigits,
  onClose,
}: DigitTrackerSheetProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Tried digits"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-border bg-background p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="terminal-glow text-sm sm:text-base">Tried digits</h2>
          <button
            type="button"
            onClick={onClose}
            className="border border-border px-2 py-0.5 text-xs text-foreground-muted transition-colors hover:bg-neutral-muted hover:text-foreground"
            aria-label="Close tried digits"
          >
            [ CLOSE ]
          </button>
        </div>

        <DigitTracker usedDigits={usedDigits} fullWidth />
      </div>
    </div>
  );
}
