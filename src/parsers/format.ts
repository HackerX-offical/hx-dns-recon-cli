import type { RecordType } from '../types.js';
import { formatA, parseA } from './a.js';
import { formatAaaa, parseAaaa } from './aaaa.js';
import { formatCname, parseCname } from './cname.js';
import { formatMx, parseMx } from './mx.js';
import { formatTxt, parseTxt } from './txt.js';

export function formatRecordByType(type: RecordType, values: unknown): string {
  switch (type) {
    case 'A':
      return formatA(parseA(values));
    case 'AAAA':
      return formatAaaa(parseAaaa(values));
    case 'CNAME':
      return formatCname(parseCname(values));
    case 'TXT':
      return formatTxt(parseTxt(values));
    case 'MX':
      return formatMx(parseMx(values));
    default:
      return formatRecordValue(values);
  }
}

/** Generic formatter for NS, SOA, CAA, and fallback cases. */
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
