/** Build a minimal DNS AXFR (type 252) query packet. */
export function encodeAxfrQuery(id: number, zone: string): Buffer {
  const labels = zone.split('.').filter(Boolean);
  const parts: number[] = [
    (id >> 8) & 0xff,
    id & 0xff,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
  ];

  for (const label of labels) {
    parts.push(label.length);
    for (const ch of label) {
      parts.push(ch.charCodeAt(0));
    }
  }
  parts.push(0);
  parts.push(0x00, 0xfc);
  parts.push(0x00, 0x01);

  return Buffer.from(parts);
}
