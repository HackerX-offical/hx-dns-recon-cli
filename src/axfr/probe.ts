import dns from 'node:dns/promises';
import { Socket } from 'node:net';
import type { AxfrResult } from '../types.js';
import { normalizeDomain } from '../resolvers/normalize.js';
import { encodeAxfrQuery } from './encode-query.js';

export const AXFR_TIMEOUT_MS = 8000;

export interface AxfrProbeDeps {
  resolveNs: (zone: string) => Promise<string[]>;
  resolve4: (host: string) => Promise<string[]>;
  queryAxfr: (nameserverIp: string, zone: string) => Promise<string[]>;
}

export function queryAxfrOverTcp(nameserver: string, zone: string): Promise<string[]> {
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
      const question = encodeAxfrQuery(id, zone);
      socket.write(question);
    });

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length >= 12) {
        const rcode = buffer[3] & 0xf;
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

const defaultDeps: AxfrProbeDeps = {
  resolveNs: (zone) => dns.resolveNs(zone),
  resolve4: (host) => dns.resolve4(host),
  queryAxfr: queryAxfrOverTcp,
};

export async function checkZoneTransfer(
  domain: string,
  deps: AxfrProbeDeps = defaultDeps,
): Promise<AxfrResult[]> {
  const zone = normalizeDomain(domain);
  let nsHosts: string[] = [];
  try {
    nsHosts = await deps.resolveNs(zone);
  } catch {
    return [{ nameserver: '(none)', vulnerable: false, error: 'No NS records' }];
  }

  const results: AxfrResult[] = [];

  for (const ns of nsHosts) {
    let ip = ns;
    try {
      const resolved = await deps.resolve4(ns);
      if (resolved[0]) ip = resolved[0];
    } catch {
      // use hostname as-is
    }

    try {
      const data = await deps.queryAxfr(ip, zone);
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
