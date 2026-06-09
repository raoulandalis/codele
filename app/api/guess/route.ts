import { evaluateGuess, isWin } from "@/lib/game/evaluateGuess";
import {
  formatFailureReveal,
  generateHint,
} from "@/lib/game/generateHint";
import { getDailyPuzzle } from "@/lib/game/getDailyPuzzle";
import { validateGuess } from "@/lib/game/validateGuess";
import { MAX_GUESSES } from "@/lib/game/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, guess, guessIndex } = body as {
      date?: string;
      guess?: string;
      guessIndex?: number;
    };

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    if (!guess || !validateGuess(guess)) {
      return NextResponse.json({ error: "Invalid guess" }, { status: 400 });
    }

    if (
      typeof guessIndex !== "number" ||
      guessIndex < 1 ||
      guessIndex > MAX_GUESSES
    ) {
      return NextResponse.json({ error: "Invalid guess index" }, { status: 400 });
    }

    const puzzle = await getDailyPuzzle(date);
    const evaluation = evaluateGuess(guess, puzzle.answer);
    const won = isWin(evaluation);
    const gameOver = won || guessIndex >= MAX_GUESSES;

    const hint =
      !won && guessIndex < MAX_GUESSES
        ? generateHint(guessIndex, guess, evaluation)
        : null;

    if (gameOver) {
      return NextResponse.json({
        gameOver: true,
        won,
        answer: puzzle.answer,
        correctPositions: evaluation.correctPositions,
        greenMask: evaluation.greenMask,
        yellowMask: evaluation.yellowMask,
        hint,
        failureReveal: !won ? formatFailureReveal(evaluation) : null,
      });
    }

    return NextResponse.json({
      gameOver: false,
      correctPositions: evaluation.correctPositions,
      greenMask: evaluation.greenMask,
      yellowMask: evaluation.yellowMask,
      hint,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
