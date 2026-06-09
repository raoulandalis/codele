import { getDailyPuzzle } from "@/lib/game/getDailyPuzzle";
import { MAX_GUESSES } from "@/lib/game/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const puzzle = await getDailyPuzzle(date);

    return NextResponse.json({
      puzzleNumber: puzzle.puzzleNumber,
      date: puzzle.date,
      maxGuesses: MAX_GUESSES,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
