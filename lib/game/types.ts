export type GameMode = "daily" | "practice";
export type GameStatus = "playing" | "won" | "lost";

export type HintType =
  | "direction"
  | "parity"
  | "largest"
  | "sum"
  | "composition";

export type Comparison = "higher" | "lower" | "equal";
export type Parity = "even" | "odd";

export interface Composition {
  allUnique: boolean;
  uniqueCount: number;
}

export interface FirstLastParity {
  first: Parity;
  last: Parity;
}

export interface GuessEvaluation {
  correctPositions: number;
  greenMask: boolean[];
  comparison: Comparison;
  parityCount: number;
  digitSum: number;
  largestDigit: number;
  composition: Composition;
  firstLastParity: FirstLastParity;
}

export interface Hint {
  attemptNumber: number;
  type: HintType;
  text: string;
}

export interface StoredGuess {
  value: string;
  greenMask: boolean[];
  correctPositions: number;
}

export interface StoredGameState {
  mode: GameMode;
  date: string;
  puzzleNumber: number;
  anonymousId: string;
  guesses: StoredGuess[];
  hints: Hint[];
  status: GameStatus;
  startTime: number;
  endTime?: number;
  currentGuessIndex: number;
  answer?: string;
}

export interface StoredStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string | null;
}

export interface DailyPuzzle {
  id: string;
  date: string;
  answer: string;
  puzzleNumber: number;
}

export const MAX_GUESSES = 6;

export const HINT_PREVIEW_LABELS: Record<number, string> = {
  1: "Direction",
  2: "Parity",
  3: "Largest",
  4: "Sum",
  5: "Composition",
};

export const DEFAULT_GUESS_DISTRIBUTION: Record<string, number> = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
};
