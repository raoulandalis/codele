"use client";

import { getDigitTileClass } from "@/lib/game/digitFeedback";
import type { StoredGuess } from "@/lib/game/types";
import type { RefObject } from "react";

interface GuessRowProps {
  rowNumber: number;
  guess?: StoredGuess;
  isActive: boolean;
  inputValue?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onInputChange?: (value: string) => void;
  onEnter?: () => void;
  isSubmitting: boolean;
}

const TILE_CLASSES = {
  green: "border-success/40 bg-success/15 text-success",
  yellow: "border-warning/40 bg-warning/15 text-warning",
  neutral: "border-border bg-background text-foreground-muted",
} as const;

export function GuessRow({
  rowNumber,
  guess,
  isActive,
  inputValue = "",
  inputRef,
  onInputChange,
  onEnter,
  isSubmitting,
}: GuessRowProps) {
  function handleChange(value: string) {
    onInputChange?.(value.replace(/\D/g, "").slice(0, 5));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      onEnter?.();
    }
  }

  const displayDigits = isActive
    ? inputValue.padEnd(5, " ").split("")
    : guess?.value.split("") ?? Array(5).fill("");

  return (
    <div className="animate-row-slide-in">
      <div className="relative flex justify-center gap-3">
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
              className={`flex h-14 w-14 items-center justify-center border font-mono text-xl sm:h-16 sm:w-16 sm:text-2xl ${
                tileState
                  ? TILE_CLASSES[tileState]
                  : isActive
                    ? "border-border bg-background text-foreground"
                    : "border-border/50 bg-background/50 text-foreground-muted/30"
              }`}
            >
              {digit.trim() || "·"}
            </div>
          );
        })}

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
    </div>
  );
}
