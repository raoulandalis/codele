import { BarChart3, Flame } from "lucide-react";

interface HeaderProps {
  puzzleNumber: number;
  mode: "daily" | "practice";
  streak: number;
  onStatsClick: () => void;
}

export function Header({
  puzzleNumber,
  mode,
  streak,
  onStatsClick,
}: HeaderProps) {
  return (
    <header className="flex w-full max-w-4xl items-center justify-between border-b border-border px-4 py-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground/50">
          Codele
        </p>
        <h1 className="text-lg font-medium">
          {mode === "daily" ? "Daily Number" : "Practice Mode"} · #{puzzleNumber}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-neutral-muted px-3 py-1.5 text-sm">
          <Flame className="h-4 w-4 text-success" />
          <span>{streak}</span>
        </div>
        <button
          type="button"
          onClick={onStatsClick}
          className="rounded-full border border-border bg-neutral-muted p-2 transition-colors hover:bg-neutral"
          aria-label="View stats"
        >
          <BarChart3 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
