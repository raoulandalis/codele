export function getDigitTileClass(
  greenMask: boolean[],
  index: number,
): "green" | "neutral" {
  if (greenMask[index]) return "green";
  return "neutral";
}
