"use client";

import { Delete } from "lucide-react";

interface DigitKeypadProps {
  disabled?: boolean;
  actionsDisabled?: boolean;
  onDigit: (digit: number) => void;
  onBackspace: () => void;
  onEnter: () => void;
  /** Compact: one digit row + backspace/enter row (mobile). */
  variant?: "default" | "compact";
}

const KEYPAD_BUTTON =
  "flex h-11 w-11 items-center justify-center border font-mono text-base transition-colors sm:h-12 sm:w-12 sm:text-lg";
const KEYPAD_ACTION =
  "flex h-11 items-center justify-center border font-mono transition-colors sm:h-12";

export function DigitKeypad({
  disabled = false,
  actionsDisabled = false,
  onDigit,
  onBackspace,
  onEnter,
  variant = "default",
}: DigitKeypadProps) {
  function digitClassName() {
    return disabled
      ? "cursor-not-allowed border-border/30 bg-neutral-muted/20 text-foreground-muted/30"
      : "border-border bg-neutral-muted text-foreground/80 hover:bg-neutral";
  }

  function actionClassName() {
    return disabled || actionsDisabled
      ? "cursor-not-allowed border-border/30 bg-neutral-muted/20 text-foreground-muted/30"
      : "border-border bg-neutral-muted text-foreground/80 hover:bg-neutral";
  }

  function renderDigit(digit: number, className: string) {
    return (
      <button
        key={digit}
        type="button"
        disabled={disabled}
        onClick={() => onDigit(digit)}
        className={`${className} ${digitClassName()}`}
        aria-label={`Digit ${digit}`}
      >
        {digit}
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex w-full flex-col items-center gap-1.5">
        <div className="flex w-full gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) =>
            renderDigit(
              digit,
              "flex h-11 min-w-0 flex-1 items-center justify-center border font-mono text-sm transition-colors",
            ),
          )}
        </div>
        <div className="flex w-full gap-1.5">
          <button
            type="button"
            disabled={disabled || actionsDisabled}
            onClick={onBackspace}
            className={`flex h-11 w-14 shrink-0 items-center justify-center border font-mono transition-colors ${actionClassName()}`}
            aria-label="Backspace"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={disabled || actionsDisabled}
            onClick={onEnter}
            className={`flex h-11 min-w-0 flex-1 items-center justify-center border font-mono text-xs transition-colors ${actionClassName()}`}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-2.5 pb-2 sm:gap-3">
      <div className="flex justify-center gap-2.5 sm:gap-3">
        {[0, 1, 2, 3, 4].map((digit) => renderDigit(digit, KEYPAD_BUTTON))}
      </div>
      <div className="flex justify-center gap-2.5 sm:gap-3">
        {[5, 6, 7, 8, 9].map((digit) => renderDigit(digit, KEYPAD_BUTTON))}
      </div>
      <div className="flex w-full max-w-[15.5rem] justify-center gap-2.5 sm:max-w-[17rem] sm:gap-3">
        <button
          type="button"
          disabled={disabled || actionsDisabled}
          onClick={onBackspace}
          className={`${KEYPAD_ACTION} w-11 sm:w-12 ${actionClassName()}`}
          aria-label="Backspace"
        >
          <Delete className="h-5 w-5" />
        </button>
        <button
          type="button"
          disabled={disabled || actionsDisabled}
          onClick={onEnter}
          className={`${KEYPAD_ACTION} min-w-[7.5rem] flex-1 px-4 text-xs sm:min-w-[8.5rem] sm:text-sm ${actionClassName()}`}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
