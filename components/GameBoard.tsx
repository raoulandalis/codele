"use client";

import type { Hint, StoredGuess } from "@/lib/game/types";
import { MAX_GUESSES } from "@/lib/game/types";
import { useDecryptionAnimation } from "@/lib/hooks/useDecryptionAnimation";
import { getUsedDigits } from "@/lib/game/keypadState";
import { validateGuess } from "@/lib/game/validateGuess";
import { DigitKeypad } from "./DigitKeypad";
import { DigitTracker, formatTriedDigits } from "./DigitTracker";
import { DigitTrackerSheet } from "./DigitTrackerSheet";
import { GuessRow } from "./GuessRow";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface GameBoardProps {
  guesses: StoredGuess[];
  hints: Hint[];
  currentGuessIndex: number;
  status: "playing" | "won" | "lost";
  onSubmitGuess: (guess: string) => void;
  isSubmitting: boolean;
}

export function GameBoard({
  guesses,
  hints,
  currentGuessIndex,
  status,
  onSubmitGuess,
  isSubmitting,
}: GameBoardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [showTriedDigits, setShowTriedDigits] = useState(false);
  const {
    decryption,
    isDecrypting,
    startDecryption,
    clearDecryption,
    settleDurationMs,
  } = useDecryptionAnimation();
  const isPlaying = status === "playing";
  const isInteractionLocked = isSubmitting || isDecrypting;

  useEffect(() => {
    if (isPlaying && !isInteractionLocked && !showTriedDigits) {
      inputRef.current?.focus();
    }
  }, [isPlaying, isInteractionLocked, currentGuessIndex, showTriedDigits]);

  useEffect(() => {
    if (!decryption || decryption.phase !== "settled") return;

    const evaluation = guesses[decryption.rowNumber - 1];
    if (evaluation?.value !== decryption.submittedValue) return;

    const timer = window.setTimeout(() => {
      clearDecryption();
    }, settleDurationMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [clearDecryption, decryption, guesses, settleDurationMs]);

  const submitCurrentGuess = useCallback(() => {
    if (isInteractionLocked || !isPlaying || inputValue.length !== 5) return;

    if (!validateGuess(inputValue)) {
      toast.error("ERR: require 5 digits, leading digit 1-9");
      return;
    }

    startDecryption(currentGuessIndex + 1, inputValue);
    onSubmitGuess(inputValue);
    setInputValue("");
  }, [
    currentGuessIndex,
    inputValue,
    isInteractionLocked,
    isPlaying,
    onSubmitGuess,
    startDecryption,
  ]);

  function appendDigit(digit: number) {
    if (!isPlaying || inputValue.length >= 5) return;
    if (inputValue.length === 0 && digit === 0) return;
    setInputValue((current) => `${current}${digit}`);
  }

  function handleBackspace() {
    if (!isPlaying || isInteractionLocked) return;
    setInputValue((current) => current.slice(0, -1));
  }

  function handleCloseTriedDigits() {
    setShowTriedDigits(false);
  }

  const usedDigits = useMemo(() => {
    const used = getUsedDigits(guesses);

    if (decryption) {
      for (const digit of decryption.submittedValue) {
        used.add(Number(digit));
      }
    }

    for (const digit of inputValue) {
      used.add(Number(digit));
    }

    return used;
  }, [decryption, guesses, inputValue]);

  const triedPreview = formatTriedDigits(usedDigits);

  return (
    <div className="flex w-full flex-col items-center px-4 pb-2">
      <div className="flex w-full max-w-4xl flex-col gap-2 sm:gap-2.5">
        {Array.from({ length: MAX_GUESSES }, (_, index) => {
          const rowNumber = index + 1;
          const guess = guesses[index];
          const hint = hints.find((item) => item.attemptNumber === rowNumber);
          const isDecryptingRow = decryption?.rowNumber === rowNumber;
          const isActive =
            isPlaying &&
            rowNumber === currentGuessIndex + 1 &&
            !isDecryptingRow;
          const hideFeedback = isDecryptingRow;

          return (
            <div
              key={rowNumber}
              className="grid grid-cols-1 items-center md:grid-cols-[1fr_auto_1fr] md:gap-x-6"
            >
              <div className="hidden md:block" />
              <GuessRow
                rowNumber={rowNumber}
                guess={guess}
                isActive={isActive}
                isRowLocked={isDecryptingRow}
                decryptionDigits={
                  isDecryptingRow ? decryption.displayDigits : null
                }
                isScrambling={
                  isDecryptingRow && decryption.phase === "scrambling"
                }
                hideFeedback={hideFeedback}
                inputValue={isActive ? inputValue : ""}
                inputRef={isActive ? inputRef : undefined}
                onInputChange={isActive ? setInputValue : undefined}
                onEnter={isActive ? submitCurrentGuess : undefined}
                isSubmitting={isInteractionLocked}
              />
              {hint && !hideFeedback ? (
                <div className="mt-1 flex h-14 items-center justify-center md:mt-0 md:h-16 md:justify-start md:pl-2">
                  <p className="animate-hint-fade-in text-center text-xs leading-snug text-foreground-muted sm:text-sm md:text-left">
                    {hint.text}
                  </p>
                </div>
              ) : (
                <div className="hidden md:block md:h-16" />
              )}
            </div>
          );
        })}

        {/* Mobile: tried-digits trigger under the board */}
        <div className="mt-2 flex justify-center md:hidden">
          <button
            type="button"
            onClick={() => setShowTriedDigits(true)}
            className="border border-border bg-neutral-muted px-3 py-2 font-mono text-[10px] text-foreground-muted transition-colors hover:bg-neutral hover:text-foreground sm:text-xs"
            aria-label={`Open tried digits: ${triedPreview}`}
          >
            $ tried_digits · {triedPreview}
          </button>
        </div>

        {/* Desktop: keypad + inline tracker */}
        <div className="mt-2 hidden items-start justify-center gap-3 sm:mt-3 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-x-6">
          <div className="hidden md:block" />
          <DigitKeypad
            disabled={!isPlaying}
            actionsDisabled={isInteractionLocked}
            onDigit={appendDigit}
            onBackspace={handleBackspace}
            onEnter={submitCurrentGuess}
          />
          <div className="flex justify-center md:justify-start md:pl-2">
            <DigitTracker usedDigits={usedDigits} />
          </div>
        </div>
      </div>

      {showTriedDigits && (
        <DigitTrackerSheet
          usedDigits={usedDigits}
          onClose={handleCloseTriedDigits}
        />
      )}
    </div>
  );
}
