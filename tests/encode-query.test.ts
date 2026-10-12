import { encodeAxfrQuery } from '../src/axfr/encode-query.js';

describe('encodeAxfrQuery', () => {
  it('encodes zone labels and AXFR type (252)', () => {
    const buf = encodeAxfrQuery(0x1234, 'example.com');
    expect(buf[0]).toBe(0x12);
    expect(buf[1]).toBe(0x34);
    expect(buf.readUInt16BE(buf.length - 4)).toBe(0x00fc);
    expect(buf[12]).toBe(7);
    expect(buf.slice(13, 20).toString()).toBe('example');
  });
});
