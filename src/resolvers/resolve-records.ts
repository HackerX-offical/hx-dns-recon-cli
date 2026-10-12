import type { DnsRecordResult, RecordType } from '../types.js';
import { DEFAULT_RECORD_TYPES } from '../types.js';
import { NODE_RESOLVERS, type DnsResolverFn } from './node-resolver.js';
import { normalizeDomain } from './normalize.js';

export interface ResolveRecordsOptions {
  resolvers?: Partial<Record<RecordType, DnsResolverFn>>;
}

function mapResolveError(err: unknown): string {
  const code = (err as NodeJS.ErrnoException).code;
  if (code === 'ENODATA' || code === 'ENOTFOUND') {
    return code;
  }
  return err instanceof Error ? err.message : String(err);
}

export async function resolveRecords(
  domain: string,
  types: RecordType[] = DEFAULT_RECORD_TYPES,
  options: ResolveRecordsOptions = {},
): Promise<DnsRecordResult[]> {
  const normalized = normalizeDomain(domain);
  const results: DnsRecordResult[] = [];

  for (const type of types) {
    const resolver = options.resolvers?.[type] ?? NODE_RESOLVERS[type];
    try {
      const values = await resolver(normalized);
      results.push({ type, values });
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENODATA' || code === 'ENOTFOUND') {
        results.push({ type, values: [], error: code });
      } else {
        results.push({ type, values: [], error: mapResolveError(err) });
      }
    }
  }

  return results;
}
