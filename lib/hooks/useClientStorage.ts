"use client";

import { getLocalDateString } from "@/lib/game/puzzleNumber";
import type { StoredGameState, StoredStats } from "@/lib/game/types";
import { loadDailyGameState } from "@/lib/storage/gameState";
import { DEFAULT_STATS, loadStats } from "@/lib/storage/stats";
import { useSyncExternalStore } from "react";

export interface DailyBootstrap {
  game: StoredGameState | null;
  showResult: boolean;
  needsFetch: boolean;
}

const EMPTY_DAILY_BOOTSTRAP: DailyBootstrap = {
  game: null,
  showResult: false,
  needsFetch: true,
};

let cachedDailyBootstrap: DailyBootstrap = EMPTY_DAILY_BOOTSTRAP;
let cachedDailyFingerprint = "";

let cachedStatsSnapshot: StoredStats = DEFAULT_STATS;
let cachedStatsFingerprint = "";

function dailyBootstrapFingerprint(
  saved: StoredGameState | null,
  today: string,
): string {
  if (!saved || saved.date !== today) return `empty:${today}`;
  return `${saved.date}:${saved.status}:${saved.currentGuessIndex}:${saved.guesses.length}`;
}

function getDailyBootstrap(): DailyBootstrap {
  const today = getLocalDateString();
  const saved = loadDailyGameState();
  const fingerprint = dailyBootstrapFingerprint(saved, today);

  if (fingerprint === cachedDailyFingerprint) {
    return cachedDailyBootstrap;
  }

  cachedDailyFingerprint = fingerprint;
  if (saved && saved.date === today) {
    cachedDailyBootstrap = {
      game: saved,
      showResult: saved.status !== "playing",
      needsFetch: false,
    };
  } else {
    cachedDailyBootstrap = EMPTY_DAILY_BOOTSTRAP;
  }

  return cachedDailyBootstrap;
}

function getStatsSnapshot(): StoredStats {
  const stats = loadStats();
  const fingerprint = JSON.stringify(stats);

  if (fingerprint === cachedStatsFingerprint) {
    return cachedStatsSnapshot;
  }

  cachedStatsFingerprint = fingerprint;
  cachedStatsSnapshot = stats;
  return cachedStatsSnapshot;
}

function noopSubscribe() {
  return () => {};
}

export function useDailyBootstrap(): DailyBootstrap {
  return useSyncExternalStore(
    noopSubscribe,
    getDailyBootstrap,
    () => EMPTY_DAILY_BOOTSTRAP,
  );
}

export function useStatsBootstrap(): StoredStats {
  return useSyncExternalStore(
    noopSubscribe,
    getStatsSnapshot,
    () => DEFAULT_STATS,
  );
}
