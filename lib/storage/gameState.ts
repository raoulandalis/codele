import type { StoredGameState } from "@/lib/game/types";

const GAME_KEY = "codele:game";

export function loadGameState(): StoredGameState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredGameState;
  } catch {
    return null;
  }
}

export function saveGameState(state: StoredGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

export function clearGameState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GAME_KEY);
}

export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";

  const existing = loadGameState()?.anonymousId;
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
