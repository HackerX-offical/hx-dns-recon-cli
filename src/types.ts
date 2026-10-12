export type RecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'SOA' | 'CAA';

export const DEFAULT_RECORD_TYPES: RecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'SOA'];

export interface DnsRecordResult {
  type: RecordType;
  values: unknown;
  error?: string;
}

export interface AxfrResult {
  nameserver: string;
  vulnerable: boolean;
  recordCount?: number;
  error?: string;
}

export interface CrtShRow {
  common_name?: string;
  name_value?: string;
}

export interface ReconPayload {
  domain: string;
  records: DnsRecordResult[];
  subdomains?: string[];
  axfr?: AxfrResult[];
}
