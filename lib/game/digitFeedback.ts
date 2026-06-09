export function getDigitTileClass(
  greenMask: boolean[],
  yellowMask: boolean[],
  index: number,
): "green" | "yellow" | "neutral" {
  if (greenMask[index]) return "green";
  if (yellowMask?.[index]) return "yellow";
  return "neutral";
}
