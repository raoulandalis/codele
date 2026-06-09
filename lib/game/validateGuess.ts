export function validateGuess(guess: string): boolean {
  return /^[1-9]\d{4}$/.test(guess);
}
