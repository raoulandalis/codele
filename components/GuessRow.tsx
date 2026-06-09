"use client";

import { getDigitTileClass } from "@/lib/game/digitFeedback";
import type { Hint, StoredGuess } from "@/lib/game/types";
import { validateGuess } from "@/lib/game/validateGuess";
import { Lock } from "lucide-react";
import { useState, type RefObject } from "react";
import { toast } from "sonner";

interface GuessRowProps {
  rowNumber: number;
  guess?: StoredGuess;
  hint?: Hint;
  isActive: boolean;
  isLocked: boolean;
  lockedPreview?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onSubmitGuess: (guess: string) => void;
  isSubmitting: boolean;
}

const TILE_CLASSES = {
  green: "border-success/40 bg-success/15 text-success",
  yellow: "border-warning/40 bg-warning/15 text-warning",
  neutral: "border-border bg-background text-foreground/70",
} as const;

export function GuessRow({
  rowNumber,
  guess,
  hint,
  isActive,
  isLocked,
  lockedPreview,
  inputRef,
  onSubmitGuess,
  isSubmitting,
}: GuessRowProps) {
  const [inputValue, setInputValue] = useState("");

  function handleChange(value: string) {
    setInputValue(value.replace(/\D/g, "").slice(0, 5));
  }

  function submitCurrentGuess() {
    if (isSubmitting || inputValue.length !== 5) return;

    if (!validateGuess(inputValue)) {
      toast.error("Enter 5 digits — first digit must be 1–9");
      return;
    }

    onSubmitGuess(inputValue);
    setInputValue("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitCurrentGuess();
    }
  }

  const displayDigits = isActive
    ? inputValue.padEnd(5, " ").split("")
    : guess?.value.split("") ?? Array(5).fill("");

  return (
    <div className="animate-row-slide-in">
      <div
        className={`relative flex items-center gap-2 rounded-lg border px-3 py-3 ${
          isActive
            ? "animate-pulse-active border-success/50 bg-neutral-muted"
            : "border-border bg-neutral-muted/40"
        }`}
      >
        <span className="w-4 font-mono text-xs text-foreground/40">
          {rowNumber}
        </span>

        <div className="flex flex-1 justify-center gap-2">
          {displayDigits.map((digit, index) => {
            const tileState = guess
              ? getDigitTileClass(
                  guess.greenMask,
                  guess.yellowMask ?? [],
                  index,
                )
              : null;

            return (
              <div
                key={index}
                className={`flex h-11 w-11 items-center justify-center rounded-md border font-mono text-lg ${
                  tileState
                    ? TILE_CLASSES[tileState]
                    : isActive
                      ? "border-border bg-background text-foreground"
                      : "border-border/50 bg-background/50 text-foreground/20"
                }`}
              >
                {digit.trim() || "·"}
              </div>
            );
          })}
        </div>

        {guess && (
          <span className="min-w-10 text-right font-mono text-xs text-success">
            {guess.correctPositions}/5
          </span>
        )}

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-background/70 backdrop-blur-[1px]">
            <Lock className="h-4 w-4 text-foreground/40" />
            {lockedPreview && (
              <span className="text-xs text-foreground/50">
                Next: {lockedPreview}
              </span>
            )}
          </div>
        )}

        {isActive && (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={inputValue}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            className="absolute inset-0 cursor-text opacity-0"
            aria-label={`Guess row ${rowNumber}`}
          />
        )}
      </div>

      {hint && (
        <p className="animate-hint-fade-in mt-2 pl-9 text-sm text-foreground/60">
          {hint.text}
        </p>
      )}

      {isActive && (
        <p className="mt-1 pl-9 text-xs text-foreground/40">
          Press Enter to submit
        </p>
      )}
    </div>
  );
}
