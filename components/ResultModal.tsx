import type { StoredGameState } from "@/lib/game/types";
import { ShareButton } from "./ShareButton";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm border border-border bg-background p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="terminal-glow text-sm sm:text-base">
            {won ? "ACCESS GRANTED" : "SESSION TERMINATED"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="border border-border px-2 py-0.5 text-xs text-foreground-muted transition-colors hover:bg-neutral-muted hover:text-foreground"
            aria-label="Close result"
          >
            [ CLOSE ]
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="border border-border bg-neutral-muted p-4 text-center">
            <p className="text-foreground-muted">TARGET NUMBER</p>
            <p className="terminal-glow mt-2 font-mono text-2xl tracking-[0.4em] text-success sm:text-3xl">
              {game.answer ?? "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border bg-neutral-muted p-3">
              <p className="text-foreground-muted">GUESSES</p>
              <p className="mt-1 font-mono text-lg text-foreground">
                {game.guesses.length}/6
              </p>
            </div>
            <div className="border border-border bg-neutral-muted p-3">
              <p className="text-foreground-muted">TIME</p>
              <p className="mt-1 font-mono text-lg text-foreground">
                {formatDuration(game.startTime, game.endTime)}
              </p>
            </div>
          </div>

          {!won && failureReveal && (
            <p className="border border-border bg-neutral-muted px-3 py-2 text-foreground-muted">
              {failureReveal}
            </p>
          )}

          <ShareButton game={game} />
        </div>
      </div>
    </div>
  );
}
