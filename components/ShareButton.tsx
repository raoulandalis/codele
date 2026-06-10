import type { StoredGameState } from "@/lib/game/types";

interface ShareButtonProps {
  game: StoredGameState;
}

function formatShareLine(guess: StoredGameState["guesses"][number]): string {
  return guess.greenMask.map((isGreen) => (isGreen ? "█" : "░")).join("");
}

export function buildShareText(game: StoredGameState): string {
  const guessCount = game.guesses.length;
  const lines = game.guesses.map(
    (guess, index) =>
      `[${String(index + 1).padStart(2, "0")}] ${formatShareLine(guess)}`,
  );

  return [
    `codele --report #${game.puzzleNumber}`,
    `attempts: ${guessCount}/6`,
    "---",
    ...lines,
  ].join("\n");
}

export function ShareButton({ game }: ShareButtonProps) {
  async function handleShare() {
    const text = buildShareText(game);

    if (navigator.share) {
      try {
        await navigator.share({ title: "Codele", text });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-full border border-border bg-neutral-muted px-4 py-2.5 text-xs transition-colors hover:bg-neutral sm:text-sm"
    >
      [ SHARE ]
    </button>
  );
}
