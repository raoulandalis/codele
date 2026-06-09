import type { StoredGameState } from "@/lib/game/types";

const DAILY_GAME_KEY = "codele:game";
const PRACTICE_GAME_KEY = "codele:practice";
const ANONYMOUS_ID_KEY = "codele:anonymousId";

function loadFromKey(key: string): StoredGameState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as StoredGameState;
  } catch {
    return null;
  }
}

function saveToKey(key: string, state: StoredGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(state));
}

export function loadDailyGameState(): StoredGameState | null {
  const saved = loadFromKey(DAILY_GAME_KEY);
  if (saved?.mode === "daily") return saved;
  return null;
}

export function saveDailyGameState(state: StoredGameState): void {
  saveToKey(DAILY_GAME_KEY, { ...state, mode: "daily" });
}

export function loadPracticeGameState(): StoredGameState | null {
  const saved = loadFromKey(PRACTICE_GAME_KEY);
  if (saved?.mode === "practice") return saved;
  return null;
}

export function savePracticeGameState(state: StoredGameState): void {
  saveToKey(PRACTICE_GAME_KEY, { ...state, mode: "practice" });
}

export function saveGameState(state: StoredGameState): void {
  if (state.mode === "practice") {
    savePracticeGameState(state);
  } else {
    saveDailyGameState(state);
  }
}

export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";

  const existing =
    localStorage.getItem(ANONYMOUS_ID_KEY) ??
    loadDailyGameState()?.anonymousId ??
    loadPracticeGameState()?.anonymousId;

  if (existing) {
    localStorage.setItem(ANONYMOUS_ID_KEY, existing);
    return existing;
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(ANONYMOUS_ID_KEY, id);
  return id;
}

export function createInitialGameState(
  partial: Pick<
    StoredGameState,
    "mode" | "date" | "puzzleNumber" | "answer" | "anonymousId"
  >,
): StoredGameState {
  return {
    ...partial,
    guesses: [],
    hints: [],
    status: "playing",
    startTime: Date.now(),
    currentGuessIndex: 0,
  };
}
