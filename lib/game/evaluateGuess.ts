import type {
  Comparison,
  Composition,
  FirstLastParity,
  GuessEvaluation,
  Parity,
} from "./types";

function getParity(digit: number): Parity {
  return digit % 2 === 0 ? "even" : "odd";
}

function getComparison(guess: string, answer: string): Comparison {
  const guessNum = Number(guess);
  const answerNum = Number(answer);
  if (guessNum === answerNum) return "equal";
  return guessNum < answerNum ? "higher" : "lower";
}

function getComposition(answer: string): Composition {
  const digits = answer.split("");
  const uniqueCount = new Set(digits).size;
  return {
    allUnique: uniqueCount === digits.length,
    uniqueCount,
  };
}

export function evaluateGuess(guess: string, answer: string): GuessEvaluation {
  const greenMask = guess.split("").map((digit, index) => digit === answer[index]);
  const correctPositions = greenMask.filter(Boolean).length;
  const answerDigits = answer.split("").map(Number);
  const parityCount = answerDigits.filter((digit) => digit % 2 === 0).length;
  const digitSum = answerDigits.reduce((sum, digit) => sum + digit, 0);
  const largestDigit = Math.max(...answerDigits);
  const composition = getComposition(answer);
  const firstLastParity: FirstLastParity = {
    first: getParity(answerDigits[0]),
    last: getParity(answerDigits[4]),
  };

  return {
    correctPositions,
    greenMask,
    comparison: getComparison(guess, answer),
    parityCount,
    digitSum,
    largestDigit,
    composition,
    firstLastParity,
  };
}

export function isWin(evaluation: GuessEvaluation): boolean {
  return evaluation.correctPositions === 5;
}
