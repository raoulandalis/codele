const EPOCH = new Date("2025-01-01T00:00:00");

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPuzzleNumber(dateString: string): number {
  const [year, month, day] = dateString.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const diffMs = target.getTime() - EPOCH.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function getYesterdayDateString(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return getLocalDateString(date);
}
