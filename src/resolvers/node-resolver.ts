import dns from 'node:dns/promises';
import type { RecordType } from '../types.js';

export type DnsResolverFn = (domain: string) => Promise<unknown>;

export const NODE_RESOLVERS: Record<RecordType, DnsResolverFn> = {
  A: (d) => dns.resolve4(d),
  AAAA: (d) => dns.resolve6(d),
  MX: (d) => dns.resolveMx(d),
  TXT: (d) => dns.resolveTxt(d),
  NS: (d) => dns.resolveNs(d),
  CNAME: (d) => dns.resolveCname(d),
  SOA: (d) => dns.resolveSoa(d),
  CAA: (d) => dns.resolveCaa(d),
};

export async function reverseLookup(ip: string): Promise<string[]> {
  try {
    return await dns.reverse(ip);
  } catch {
    return [];
  }
}
