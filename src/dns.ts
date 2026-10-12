import dns from 'node:dns/promises';

export type RecordType =
  | 'A'
  | 'AAAA'
  | 'MX'
  | 'TXT'
  | 'NS'
  | 'CNAME'
  | 'SOA'
  | 'CAA';

const RESOLVERS: Record<RecordType, (domain: string) => Promise<unknown>> = {
  A: (d) => dns.resolve4(d),
  AAAA: (d) => dns.resolve6(d),
  MX: (d) => dns.resolveMx(d),
  TXT: (d) => dns.resolveTxt(d),
  NS: (d) => dns.resolveNs(d),
  CNAME: (d) => dns.resolveCname(d),
  SOA: (d) => dns.resolveSoa(d),
  CAA: (d) => dns.resolveCaa(d),
};

export interface DnsRecordResult {
  type: RecordType;
  values: unknown;
  error?: string;
}

export async function resolveRecords(
  domain: string,
  types: RecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'SOA'],
): Promise<DnsRecordResult[]> {
  const normalized = domain.toLowerCase().replace(/\.$/, '');
  const results: DnsRecordResult[] = [];

  for (const type of types) {
    try {
      const values = await RESOLVERS[type](normalized);
      results.push({ type, values });
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENODATA' || code === 'ENOTFOUND') {
        results.push({ type, values: [], error: code });
      } else {
        results.push({
          type,
          values: [],
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  return results;
}

export async function reverseLookup(ip: string): Promise<string[]> {
  try {
    return await dns.reverse(ip);
  } catch {
    return [];
  }
}

export function formatRecordValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return '(empty)';
    return value
      .map((v) => {
        if (typeof v === 'string') return v;
        if (Array.isArray(v)) return v.join('');
        if (typeof v === 'object' && v !== null) {
          return JSON.stringify(v);
        }
        return String(v);
      })
      .join('; ');
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}
