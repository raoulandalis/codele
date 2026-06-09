import { getDailyPuzzle } from "@/lib/game/getDailyPuzzle";
import { createServerClient } from "@/lib/supabase/server";

export async function recordDailyResult(
  date: string,
  won: boolean,
  guessCount: number,
): Promise<void> {
  const puzzle = await getDailyPuzzle(date);
  const supabase = createServerClient();

  const { error } = await supabase.rpc("record_daily_result", {
    p_date: date,
    p_puzzle_id: puzzle.id,
    p_won: won,
    p_guess_count: guessCount,
  });

  if (error) {
    throw new Error(error.message);
  }
}
