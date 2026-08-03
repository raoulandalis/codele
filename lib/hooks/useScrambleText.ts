"use client";

import { useLayoutEffect, useRef, useState } from "react";

const SCRAMBLE_DURATION_MS = 900;
const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$@*&";

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? "#";
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useScrambleText(target: string) {
  const [display, setDisplay] = useState(target);
  const [isScrambling, setIsScrambling] = useState(false);
  const rafRef = useRef(0);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(target);
      setIsScrambling(false);
      return;
    }

    setIsScrambling(true);
    setDisplay(Array.from({ length: target.length }, randomChar).join(""));

    const startTime = performance.now();
    const nextUpdate = Array.from({ length: target.length }, (_, index) =>
      startTime + 20 + index * 40 + Math.random() * 30,
    );

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / SCRAMBLE_DURATION_MS);
      const lockedCount = Math.floor(progress * target.length);

      if (elapsed >= SCRAMBLE_DURATION_MS) {
        setDisplay(target);
        setIsScrambling(false);
        return;
      }

      setDisplay((current) => {
        const chars = current
          .padEnd(target.length)
          .split("")
          .slice(0, target.length);
        for (let index = 0; index < target.length; index++) {
          if (index < lockedCount) {
            chars[index] = target[index] ?? "";
            continue;
          }
          if (now >= nextUpdate[index]) {
            chars[index] = randomChar();
            nextUpdate[index] = now + 28 + Math.random() * 42 + index * 7;
          }
        }
        return chars.join("");
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return { display, isScrambling };
}
