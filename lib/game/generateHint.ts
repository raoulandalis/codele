import type { GuessEvaluation, Hint, HintType } from "./types";

export function generateHint(
  attemptNumber: number,
  guess: string,
  evaluation: GuessEvaluation,
): Hint | null {
  let type: HintType | null = null;
  let text = "";

  switch (attemptNumber) {
    case 1:
      type = "direction";
      if (evaluation.comparison === "equal") {
        text = "Target equals your guess";
      } else if (evaluation.comparison === "higher") {
        text = "Target is higher than your guess";
      } else {
        text = "Target is lower than your guess";
      }
      break;
    case 2:
      type = "parity";
      text =
        evaluation.parityCount === 1
          ? "Target has 1 even digit"
          : `Target has ${evaluation.parityCount} even digits`;
      break;
    case 3:
      type = "largest";
      text = `Largest digit in target is ${evaluation.largestDigit}`;
      break;
    case 4:
      type = "sum";
      text = `Sum of target digits is ${evaluation.digitSum}`;
      break;
    case 5:
      type = "composition";
      text = evaluation.composition.allUnique
        ? "All digits in target are unique"
        : `Target has ${evaluation.composition.uniqueCount} unique digits`;
      break;
    default:
      return null;
  }

  return { attemptNumber, type, text };
}

export function formatFailureReveal(evaluation: GuessEvaluation): string {
  return `First digit is ${evaluation.firstLastParity.first}, last digit is ${evaluation.firstLastParity.last}`;
}
