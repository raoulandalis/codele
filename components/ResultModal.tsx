import type { StoredGameState } from "@/lib/game/types";
import { ShareButton } from "./ShareButton";
import { X } from "lucide-react";

interface ResultModalProps {
  game: StoredGameState;
  failureReveal?: string | null;
  onClose: () => void;
}

function formatDuration(startTime: number, endTime?: number): string {
  const elapsed = Math.max(0, (endTime ?? Date.now()) - startTime);
  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ResultModal({
  game,
  failureReveal,
  onClose,
}: ResultModalProps) {
  const won = game.status === "won";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {won ? "Code cracked" : "Case closed"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-neutral-muted"
            aria-label="Close result"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-neutral-muted p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-foreground/50">
              Target number
            </p>
            <p className="mt-2 font-mono text-3xl tracking-[0.4em] text-success">
              {game.answer ?? "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-neutral-muted p-3">
              <p className="text-foreground/50">Guesses</p>
              <p className="mt-1 font-mono text-lg">{game.guesses.length}/6</p>
            </div>
            <div className="rounded-lg border border-border bg-neutral-muted p-3">
              <p className="text-foreground/50">Time</p>
              <p className="mt-1 font-mono text-lg">
                {formatDuration(game.startTime, game.endTime)}
              </p>
            </div>
          </div>

          {!won && failureReveal && (
            <p className="rounded-lg border border-border bg-neutral-muted px-3 py-2 text-sm text-foreground/70">
              {failureReveal}
            </p>
          )}

          <ShareButton game={game} />
        </div>
      </div>
    </div>
  );
}
