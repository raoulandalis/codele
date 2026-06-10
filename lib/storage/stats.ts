import { getYesterdayDateString } from "@/lib/game/puzzleNumber";
import type { StoredStats } from "@/lib/game/types";

const STATS_KEY = "codele:stats";

export const DEFAULT_STATS: StoredStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedDate: null,
};

export function loadStats(): StoredStats {
  if (typeof window === "undefined") return DEFAULT_STATS;

  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) } as StoredStats;
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: StoredStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getWinPercent(stats: StoredStats): number {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
}

export function recordDailyGameResult(
  date: string,
  won: boolean,
): StoredStats {
  const stats = loadStats();
  const yesterday = getYesterdayDateString(date);

  let currentStreak = stats.currentStreak;

  if (stats.lastPlayedDate && stats.lastPlayedDate !== date) {
    if (stats.lastPlayedDate !== yesterday) {
      currentStreak = 0;
    }
  }

  if (won) {
    currentStreak += 1;
  } else {
    currentStreak = 0;
  }

  const updated: StoredStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (won ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    lastPlayedDate: date,
  };

  saveStats(updated);
  return updated;
}
