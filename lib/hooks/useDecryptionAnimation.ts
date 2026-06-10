"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCRAMBLE_DURATION_MS = 650;
const SETTLE_DURATION_MS = 120;

export type DecryptionPhase = "scrambling" | "settled";

export interface DecryptionState {
  rowNumber: number;
  submittedValue: string;
  displayDigits: string[];
  phase: DecryptionPhase;
}

function randomDigit(): string {
  return String(Math.floor(Math.random() * 10));
}

export function useDecryptionAnimation() {
  const [decryption, setDecryption] = useState<DecryptionState | null>(null);
  const rafRef = useRef<number>(0);

  const startDecryption = useCallback((rowNumber: number, submittedValue: string) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDecryption({
        rowNumber,
        submittedValue,
        displayDigits: submittedValue.split(""),
        phase: "settled",
      });
      return;
    }

    setDecryption({
      rowNumber,
      submittedValue,
      displayDigits: submittedValue.split(""),
      phase: "scrambling",
    });
  }, []);

  const clearDecryption = useCallback(() => {
    setDecryption(null);
  }, []);

  useEffect(() => {
    if (decryption?.phase !== "scrambling") return;

    const startTime = performance.now();
    const digitNextUpdate = Array.from({ length: 5 }, (_, index) =>
      startTime + 20 + index * 37 + Math.random() * 30,
    );

    const tick = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed >= SCRAMBLE_DURATION_MS) {
        setDecryption((current) =>
          current
            ? {
                ...current,
                displayDigits: current.submittedValue.split(""),
                phase: "settled",
              }
            : null,
        );
        return;
      }

      setDecryption((current) => {
        if (!current || current.phase !== "scrambling") return current;

        const nextDigits = [...current.displayDigits];
        for (let index = 0; index < 5; index++) {
          if (now >= digitNextUpdate[index]) {
            nextDigits[index] = randomDigit();
            digitNextUpdate[index] =
              now + 28 + Math.random() * 42 + index * 7;
          }
        }

        return { ...current, displayDigits: nextDigits };
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [decryption?.phase, decryption?.rowNumber, decryption?.submittedValue]);

  return {
    decryption,
    isDecrypting: decryption !== null,
    startDecryption,
    clearDecryption,
    settleDurationMs: SETTLE_DURATION_MS,
  };
}
