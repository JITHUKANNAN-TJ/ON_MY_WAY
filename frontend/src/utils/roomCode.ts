export function normalizeRoomCode(input: string): string {
  const cleaned = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

  if (cleaned.length <= 4) return cleaned;
  return cleaned.slice(0, 4) + "-" + cleaned.slice(4, 8);
}

export function stripRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function parseShareLink(input: string): string | null {
  const match = input.match(
    /[?/]room\/([A-Za-z0-9]{4}-?[A-Za-z0-9]{4})/i
  );
  if (match) return match[1].toUpperCase();
  return null;
}
