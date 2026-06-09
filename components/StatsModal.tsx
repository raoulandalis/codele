import type { StoredStats } from "@/lib/game/types";
import { getWinPercent } from "@/lib/storage/stats";
import { X } from "lucide-react";

interface StatsModalProps {
  stats: StoredStats;
  onClose: () => void;
}

export function StatsModal({ stats, onClose }: StatsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Statistics</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-neutral-muted"
            aria-label="Close stats"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Played" value={stats.gamesPlayed} />
          <StatCard label="Win %" value={`${getWinPercent(stats)}%`} />
          <StatCard label="Current streak" value={stats.currentStreak} />
          <StatCard label="Best streak" value={stats.bestStreak} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-neutral-muted p-4 text-center">
      <p className="font-mono text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-foreground/50">
        {label}
      </p>
    </div>
  );
}
