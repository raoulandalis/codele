"use client";

import type { StoredGameState } from "@/lib/game/types";
import { toast } from "sonner";

interface ShareButtonProps {
  game: StoredGameState;
}

function formatShareLine(guess: StoredGameState["guesses"][number]): string {
  return guess.greenMask.map((isGreen) => (isGreen ? "🟩" : "⬛")).join("");
}

export function buildShareText(game: StoredGameState): string {
  const score =
    game.status === "won" ? `${game.guesses.length}/6` : "X/6";
  const lines = game.guesses.map(formatShareLine);

  return [`Codele #${game.puzzleNumber} ${score}`, "", ...lines].join("\n");
}

export function ShareButton({ game }: ShareButtonProps) {
  async function handleCopy() {
    const text = buildShareText(game);

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Results copied");
    } catch {
      toast.error("Failed to copy results");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full border border-border bg-neutral-muted px-4 py-2.5 text-xs transition-colors hover:bg-neutral sm:text-sm"
    >
      [ COPY ]
    </button>
  );
}
