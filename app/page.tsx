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
  loadDailyGameState,
  saveDailyGameState,
  saveGameState,
  savePracticeGameState,
} from "@/lib/storage/gameState";
import {
  useDailyBootstrap,
  useStatsBootstrap,
} from "@/lib/hooks/useClientStorage";
import { recordDailyGameResult } from "@/lib/storage/stats";
import { Calendar, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
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
  const today = getLocalDateString();
  const bootstrap = useDailyBootstrap();
  const bootstrapStats = useStatsBootstrap();

  const [game, setGame] = useState<StoredGameState | null>(null);
  const [stats, setStats] = useState<typeof bootstrapStats | null>(null);
  const [failureReveal, setFailureReveal] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);

  const activeGame = game ?? bootstrap.game;
  const activeStats = stats ?? bootstrapStats;
  const activeShowResult = showResult ?? bootstrap.showResult;
  const activeLoading = isLoading ?? bootstrap.needsFetch;

  useEffect(() => {
    if (!activeLoading || activeGame) return;

    let cancelled = false;
    const anonymousId = getOrCreateAnonymousId();

    void (async () => {
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

        if (cancelled) return;

        setGame(initial);
        saveDailyGameState(initial);
        setShowResult(false);
        setFailureReveal(null);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load daily puzzle",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeLoading, activeGame, today]);

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
    if (!activeGame || activeGame.status !== "playing" || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const data =
        activeGame.mode === "daily"
          ? await submitDailyGuess(guess, activeGame)
          : submitPracticeGuess(guess, activeGame);

      const guessIndex = activeGame.currentGuessIndex + 1;
      const nextGame: StoredGameState = {
        ...activeGame,
        guesses: [
          ...activeGame.guesses,
          {
            value: guess,
            greenMask: data.greenMask,
            yellowMask: data.yellowMask,
            correctPositions: data.correctPositions,
          },
        ],
        hints: data.hint ? [...activeGame.hints, data.hint] : activeGame.hints,
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

        if (activeGame.mode === "daily") {
          setFailureReveal(data.failureReveal ?? null);
          const updatedStats = recordDailyGameResult(
            activeGame.date,
            Boolean(data.won),
          );
          setStats(updatedStats);

          void fetch("/api/result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: activeGame.date,
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

  function handlePracticeMode() {
    const anonymousId = getOrCreateAnonymousId();
    const practiceGame = createInitialGameState({
      mode: "practice",
      date: today,
      puzzleNumber: getPuzzleNumber(today),
      anonymousId,
      answer: generatePracticeAnswer(),
    });

    setGame(practiceGame);
    setIsLoading(false);
    savePracticeGameState(practiceGame);
    setShowResult(false);
    setFailureReveal(null);
    toast.message("OK: practice session initialized");
  }

  function handleDailyMode() {
    const saved = loadDailyGameState();
    if (saved && saved.date === today) {
      setGame(saved);
      setShowResult(saved.status !== "playing");
      setFailureReveal(null);
      return;
    }

    setIsLoading(true);
  }

  if (activeLoading || !activeGame) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-foreground-muted">
          Connecting to puzzle server…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-4xl flex-col">
      <Header
        puzzleNumber={activeGame.puzzleNumber}
        mode={activeGame.mode}
        streak={activeStats.currentStreak}
        onStatsClick={() => setShowStats(true)}
      />

      <div className="flex min-h-0 flex-1 flex-col justify-end">
        <GameBoard
          guesses={activeGame.guesses}
          hints={activeGame.hints}
          currentGuessIndex={activeGame.currentGuessIndex}
          status={activeGame.status}
          onSubmitGuess={handleSubmitGuess}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="flex shrink-0 justify-center px-4 pb-6 pt-2">
        {activeGame.mode === "daily" ? (
          <button
            type="button"
            onClick={handlePracticeMode}
            className="flex items-center gap-2 border border-border bg-neutral-muted px-4 py-2 text-sm transition-colors hover:bg-neutral"
          >
            <RotateCcw className="h-4 w-4" />
            Practice mode
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDailyMode}
            className="flex items-center gap-2 border border-border bg-neutral-muted px-4 py-2 text-sm transition-colors hover:bg-neutral"
          >
            <Calendar className="h-4 w-4" />
            Today&apos;s puzzle
          </button>
        )}
      </div>

      {showStats && (
        <StatsModal
          stats={activeStats}
          onClose={() => setShowStats(false)}
        />
      )}

      {activeShowResult && (
        <ResultModal
          game={activeGame}
          failureReveal={failureReveal}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
