export function formatCname(values: string[]): string {
  if (values.length === 0) return '(empty)';
  return values.join('; ');
}

export function parseCname(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.filter((v): v is string => typeof v === 'string');
}
