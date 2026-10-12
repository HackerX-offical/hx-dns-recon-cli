import type { CrtShRow } from '../types.js';
import { normalizeDomain } from '../resolvers/normalize.js';

export type FetchFn = typeof fetch;

export async function fetchCrtShSubdomains(
  domain: string,
  fetchImpl: FetchFn = fetch,
): Promise<string[]> {
  const normalized = normalizeDomain(domain);
  const url = `https://crt.sh/?q=${encodeURIComponent(`%.${normalized}`)}&output=json`;

  const res = await fetchImpl(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'hx-dns-recon-cli/1.0' },
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    throw new Error(`crt.sh HTTP ${res.status}`);
  }

  const text = await res.text();
  if (!text.trim()) return [];

  let rows: CrtShRow[];
  try {
    rows = JSON.parse(text) as CrtShRow[];
  } catch {
    throw new Error('crt.sh returned invalid JSON');
  }

  return extractSubdomainsFromRows(rows, normalized);
}

export function extractSubdomainsFromRows(rows: CrtShRow[], apex: string): string[] {
  const names = new Set<string>();
  for (const row of rows) {
    const blob = row.name_value ?? row.common_name ?? '';
    for (const part of blob.split('\n')) {
      const n = part.trim().toLowerCase().replace(/^\*\./, '');
      if (!n) continue;
      if (n === apex || n.endsWith(`.${apex}`)) {
        names.add(n);
      }
    }
  }
  return [...names].sort();
}
