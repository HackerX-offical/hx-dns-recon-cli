import dns from 'node:dns/promises';
import { Socket } from 'node:net';

const AXFR_TIMEOUT_MS = 8000;

export interface AxfrResult {
  nameserver: string;
  vulnerable: boolean;
  recordCount?: number;
  error?: string;
}

function queryAxfr(nameserver: string, zone: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const records: string[] = [];
    let buffer = Buffer.alloc(0);

    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('AXFR timeout'));
    }, AXFR_TIMEOUT_MS);

    socket.connect(53, nameserver, () => {
      const id = Math.floor(Math.random() * 65535);
      const question = encodeQuery(id, zone);
      socket.write(question);
    });

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length >= 12) {
        const rcode = (buffer[3] >> 0) & 0xf;
        if (rcode !== 0 && buffer.length > 12) {
          clearTimeout(timer);
          socket.destroy();
          if (rcode === 5) {
            reject(new Error('REFUSED'));
          } else {
            reject(new Error(`DNS RCODE ${rcode}`));
          }
          return;
        }
        records.push(buffer.toString('hex').slice(0, 64));
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    socket.on('close', () => {
      clearTimeout(timer);
      resolve(records);
    });
  });
}

function encodeQuery(id: number, zone: string): Buffer {
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

export async function checkZoneTransfer(domain: string): Promise<AxfrResult[]> {
  const zone = domain.toLowerCase().replace(/\.$/, '');
  let nsHosts: string[] = [];
  try {
    nsHosts = await dns.resolveNs(zone);
  } catch {
    return [{ nameserver: '(none)', vulnerable: false, error: 'No NS records' }];
  }

  const results: AxfrResult[] = [];

  for (const ns of nsHosts) {
    let ip = ns;
    try {
      const resolved = await dns.resolve4(ns);
      if (resolved[0]) ip = resolved[0];
    } catch {
      // use hostname as-is
    }

    try {
      const data = await queryAxfr(ip, zone);
      const vulnerable = data.length > 0;
      results.push({
        nameserver: ns,
        vulnerable,
        recordCount: data.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        nameserver: ns,
        vulnerable: false,
        error: msg,
      });
    }
  }

  return results;
}
