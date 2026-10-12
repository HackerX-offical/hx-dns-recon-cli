export function formatTxt(chunks: string[][]): string {
  if (chunks.length === 0) return '(empty)';
  return chunks.map((parts) => parts.join('')).join('; ');
}

export function parseTxt(values: unknown): string[][] {
  if (!Array.isArray(values)) return [];
  return values.map((row) => {
    if (Array.isArray(row)) {
      return row.map((p) => String(p));
    }
    return [String(row)];
  });
}
