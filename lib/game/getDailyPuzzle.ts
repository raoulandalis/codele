import { createServerClient } from "@/lib/supabase/server";
import { generateAnswer } from "./generateAnswer";
import { getPuzzleNumber } from "./puzzleNumber";
import type { DailyPuzzle } from "./types";

export async function getDailyPuzzle(date: string): Promise<DailyPuzzle> {
  const supabase = createServerClient();
  const { data: existing, error: selectError } = await supabase
    .from("daily_puzzles")
    .select("id, date, answer")
    .eq("date", date)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existing) {
    return {
      id: existing.id,
      date: existing.date,
      answer: existing.answer,
      puzzleNumber: getPuzzleNumber(date),
    };
  }

  const answer = generateAnswer(date);
  const { data: inserted, error: insertError } = await supabase
    .from("daily_puzzles")
    .upsert({ date, answer }, { onConflict: "date" })
    .select("id, date, answer")
    .single();

  if (insertError || !inserted) {
    throw new Error(insertError?.message ?? "Failed to create daily puzzle");
  }

  return {
    id: inserted.id,
    date: inserted.date,
    answer: inserted.answer,
    puzzleNumber: getPuzzleNumber(date),
  };
}
