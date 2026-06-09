"use client";

import { GameBoard } from "@/components/GameBoard";
import { Header } from "@/components/Header";
import { ResultModal } from "@/components/ResultModal";
import { StatsModal } from "@/components/StatsModal";
import { evaluateGuess, isWin } from "@/lib/game/evaluateGuess";
import {
  formatFailureReveal,
  generateHint,
} from "@/lib/game/generateHint";
import { generatePracticeAnswer } from "@/lib/game/generateAnswer";
import { getLocalDateString, getPuzzleNumber } from "@/lib/game/puzzleNumber";
import type { Hint, StoredGameState } from "@/lib/game/types";
import { MAX_GUESSES } from "@/lib/game/types";
import {
  createInitialGameState,
  getOrCreateAnonymousId,
  loadGameState,
  saveGameState,
} from "@/lib/storage/gameState";
import { loadStats, recordDailyGameResult } from "@/lib/storage/stats";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface GuessApiResponse {
  gameOver: boolean;
  won?: boolean;
  answer?: string;
  correctPositions: number;
  greenMask: boolean[];
  yellowMask: boolean[];
  hint?: Hint | null;
  failureReveal?: string | null;
  error?: string;
}

export default function Home() {
  const [game, setGame] = useState<StoredGameState | null>(null);
  const [stats, setStats] = useState(loadStats());
  const [failureReveal, setFailureReveal] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = getLocalDateString();

  const initializeDailyGame = useCallback(async () => {
    const anonymousId = getOrCreateAnonymousId();
    const saved = loadGameState();

    if (
      saved &&
      saved.mode === "daily" &&
      saved.date === today &&
      saved.status === "playing"
    ) {
      setGame(saved);
      setIsLoading(false);
      return;
    }

    if (
      saved &&
      saved.mode === "daily" &&
      saved.date === today &&
      saved.status !== "playing"
    ) {
      setGame(saved);
      setShowResult(true);
      setFailureReveal(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/puzzle?date=${today}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load puzzle");
      }

      const initial = createInitialGameState({
        mode: "daily",
        date: today,
        puzzleNumber: data.puzzleNumber,
        anonymousId,
      });

      setGame(initial);
      saveGameState(initial);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load daily puzzle",
      );
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    void (async () => {
      const saved = loadGameState();

      if (saved?.mode === "practice" && saved.status === "playing") {
        setGame(saved);
        setIsLoading(false);
        return;
      }

      if (saved?.mode === "practice" && saved.status !== "playing") {
        setGame(saved);
        setShowResult(true);
        setIsLoading(false);
        return;
      }

      await initializeDailyGame();
    })();
  }, [initializeDailyGame]);

  async function submitDailyGuess(guess: string, current: StoredGameState) {
    const guessIndex = current.currentGuessIndex + 1;

    const response = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: current.date,
        guess,
        guessIndex,
        anonymousId: current.anonymousId,
      }),
    });

    const data = (await response.json()) as GuessApiResponse;

    if (!response.ok) {
      throw new Error(data.error ?? "Failed to submit guess");
    }

    return data;
  }

  function submitPracticeGuess(guess: string, current: StoredGameState) {
    if (!current.answer) {
      throw new Error("Missing practice answer");
    }

    const guessIndex = current.currentGuessIndex + 1;
    const evaluation = evaluateGuess(guess, current.answer);
    const won = isWin(evaluation);
    const gameOver = won || guessIndex >= MAX_GUESSES;

    const hint =
      !won && guessIndex < MAX_GUESSES
        ? generateHint(guessIndex, guess, evaluation)
        : null;

    return {
      gameOver,
      won,
      answer: current.answer,
      correctPositions: evaluation.correctPositions,
      greenMask: evaluation.greenMask,
      yellowMask: evaluation.yellowMask,
      hint,
      failureReveal: gameOver && !won ? formatFailureReveal(evaluation) : null,
    };
  }

  async function handleSubmitGuess(guess: string) {
    if (!game || game.status !== "playing" || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const data =
        game.mode === "daily"
          ? await submitDailyGuess(guess, game)
          : submitPracticeGuess(guess, game);

      const guessIndex = game.currentGuessIndex + 1;
      const nextGame: StoredGameState = {
        ...game,
        guesses: [
          ...game.guesses,
          {
            value: guess,
            greenMask: data.greenMask,
            yellowMask: data.yellowMask,
            correctPositions: data.correctPositions,
          },
        ],
        hints: data.hint ? [...game.hints, data.hint] : game.hints,
        currentGuessIndex: guessIndex,
      };

      if (data.gameOver) {
        const finished: StoredGameState = {
          ...nextGame,
          status: data.won ? "won" : "lost",
          endTime: Date.now(),
          answer: data.answer,
        };

        setGame(finished);
        saveGameState(finished);

        if (game.mode === "daily") {
          setFailureReveal(data.failureReveal ?? null);
          const updatedStats = recordDailyGameResult(
            game.date,
            Boolean(data.won),
          );
          setStats(updatedStats);

          void fetch("/api/result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: game.date,
              won: data.won,
              guessCount: guessIndex,
            }),
          }).catch(() => {
            // analytics are best-effort
          });
        } else {
          setFailureReveal(data.failureReveal ?? null);
        }

        setShowResult(true);
      } else {
        setGame(nextGame);
        saveGameState(nextGame);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit guess",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePracticeReset() {
    const anonymousId = getOrCreateAnonymousId();
    const practiceGame = createInitialGameState({
      mode: "practice",
      date: today,
      puzzleNumber: getPuzzleNumber(today),
      anonymousId,
      answer: generatePracticeAnswer(),
    });

    setGame(practiceGame);
    saveGameState(practiceGame);
    setShowResult(false);
    setFailureReveal(null);
    toast.message("Practice puzzle ready");
  }

  if (isLoading || !game) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-mono text-sm text-foreground/50">Loading case file…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col">
      <Header
        puzzleNumber={game.puzzleNumber}
        mode={game.mode}
        streak={stats.currentStreak}
        onStatsClick={() => setShowStats(true)}
      />

      <GameBoard
        guesses={game.guesses}
        hints={game.hints}
        currentGuessIndex={game.currentGuessIndex}
        status={game.status}
        onSubmitGuess={handleSubmitGuess}
        isSubmitting={isSubmitting}
      />

      <div className="mt-auto flex justify-center px-4 pb-8">
        <button
          type="button"
          onClick={handlePracticeReset}
          className="flex items-center gap-2 rounded-lg border border-border bg-neutral-muted px-4 py-2 text-sm transition-colors hover:bg-neutral"
        >
          <RotateCcw className="h-4 w-4" />
          Practice mode
        </button>
      </div>

      {showStats && (
        <StatsModal stats={stats} onClose={() => setShowStats(false)} />
      )}

      {showResult && (
        <ResultModal
          game={game}
          failureReveal={failureReveal}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
