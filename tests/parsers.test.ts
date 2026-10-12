import { formatA, parseA } from '../src/parsers/a.js';
import { formatAaaa } from '../src/parsers/aaaa.js';
import { formatCname } from '../src/parsers/cname.js';
import { formatMx, parseMx } from '../src/parsers/mx.js';
import { formatTxt, parseTxt } from '../src/parsers/txt.js';
import { formatRecordByType } from '../src/parsers/format.js';

describe('record parsers', () => {
  it('formats A records', () => {
    expect(formatA(parseA(['93.184.216.34', '93.184.216.35']))).toBe(
      '93.184.216.34; 93.184.216.35',
    );
    expect(formatA([])).toBe('(empty)');
  });

  it('formats AAAA records', () => {
    expect(formatAaaa(['2606:2800:220:1:248:1893:25c8:1946'])).toContain('2606');
  });

  it('formats CNAME records', () => {
    expect(formatCname(['alias.example.com'])).toBe('alias.example.com');
  });

  it('formats TXT as joined chunks', () => {
    expect(formatTxt(parseTxt([['v=spf1', ' include:_spf.example.com']]))).toBe(
      'v=spf1 include:_spf.example.com',
    );
  });

  it('formats MX by priority', () => {
    const mx = parseMx([
      { exchange: 'mx2.example.com', priority: 20 },
      { exchange: 'mx1.example.com', priority: 10 },
    ]);
    expect(formatMx(mx)).toBe('10 mx1.example.com; 20 mx2.example.com');
  });

  it('formatRecordByType dispatches by type', () => {
    expect(formatRecordByType('MX', [{ exchange: 'mx.example.com', priority: 5 }])).toBe(
      '5 mx.example.com',
    );
  });
});
