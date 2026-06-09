"use client";

import type { Hint, StoredGuess } from "@/lib/game/types";
import { Lock } from "lucide-react";
import { useState, type RefObject } from "react";

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
    const digitsOnly = value.replace(/\D/g, "").slice(0, 5);
    setInputValue(digitsOnly);

    if (digitsOnly.length === 5 && !isSubmitting) {
      onSubmitGuess(digitsOnly);
      setInputValue("");
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
            const isCorrect = guess?.greenMask[index];
            return (
              <div
                key={index}
                className={`flex h-11 w-11 items-center justify-center rounded-md border font-mono text-lg ${
                  guess
                    ? isCorrect
                      ? "border-success/40 bg-success/15 text-success"
                      : "border-border bg-background text-foreground/70"
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
    </div>
  );
}
