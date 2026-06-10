import type { StoredStats } from "@/lib/game/types";
import { getWinPercent } from "@/lib/storage/stats";

interface StatsModalProps {
  stats: StoredStats;
  onClose: () => void;
}

export function StatsModal({ stats, onClose }: StatsModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm border border-border bg-background p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="terminal-glow text-sm sm:text-base">
            $ cat ~/.codele/stats
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="border border-border px-2 py-0.5 text-xs text-foreground-muted transition-colors hover:bg-neutral-muted hover:text-foreground"
            aria-label="Close stats"
          >
            [ CLOSE ]
          </button>
        </div>

        <div className="space-y-2 border border-border bg-neutral-muted p-4 font-mono text-xs sm:text-sm">
          <StatLine label="played" value={stats.gamesPlayed} />
          <StatLine label="win_rate" value={`${getWinPercent(stats)}%`} />
          <StatLine label="streak" value={stats.currentStreak} />
          <StatLine label="best_streak" value={stats.bestStreak} />
        </div>
      </div>
    </div>
  );
}

function StatLine({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <p className="flex justify-between gap-4">
      <span className="text-foreground-muted">{label}:</span>
      <span className="text-foreground">{value}</span>
    </p>
  );
}
