export interface MxRecord {
  exchange: string;
  priority: number;
}

export function formatMx(records: MxRecord[]): string {
  if (records.length === 0) return '(empty)';
  return records
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((r) => `${r.priority} ${r.exchange}`)
    .join('; ');
}

export function parseMx(values: unknown): MxRecord[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter(
      (v): v is MxRecord =>
        typeof v === 'object' &&
        v !== null &&
        'exchange' in v &&
        'priority' in v &&
        typeof (v as MxRecord).exchange === 'string' &&
        typeof (v as MxRecord).priority === 'number',
    )
    .map((r) => ({ exchange: r.exchange, priority: r.priority }));
}
