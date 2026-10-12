import type { AxfrResult, DnsRecordResult, ReconPayload } from '../types.js';

export function recordsJson(domain: string, records: DnsRecordResult[]): string {
  return JSON.stringify({ domain, records }, null, 2);
}

export function subdomainsJson(domain: string, subdomains: string[]): string {
  return JSON.stringify({ domain, subdomains }, null, 2);
}

export function axfrJson(domain: string, results: AxfrResult[]): string {
  return JSON.stringify({ domain, results }, null, 2);
}

export function reconJson(payload: ReconPayload): string {
  return JSON.stringify(payload, null, 2);
}
