import { recordDailyResult } from "@/lib/analytics/recordDailyResult";
import { MAX_GUESSES } from "@/lib/game/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, won, guessCount } = body as {
      date?: string;
      won?: boolean;
      guessCount?: number;
    };

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    if (typeof won !== "boolean") {
      return NextResponse.json({ error: "Invalid won flag" }, { status: 400 });
    }

    if (
      typeof guessCount !== "number" ||
      guessCount < 1 ||
      guessCount > MAX_GUESSES
    ) {
      return NextResponse.json({ error: "Invalid guess count" }, { status: 400 });
    }

    await recordDailyResult(date, won, guessCount);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
