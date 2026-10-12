# hx-dns-recon-cli architecture

DNS reconnaissance CLI for authorized security assessments. The codebase is split into small modules so resolvers, parsers, CT lookup, AXFR probing, and output formatting can be tested without live network calls (except optional integration tests).

## Layout

```
src/
  types.ts                 # Shared types and default record sets
  cli.ts                   # Commander entrypoint (hx-dns)
  index.ts                 # Library re-exports
  resolvers/
    normalize.ts           # Domain normalization
    node-resolver.ts       # node:dns/promises bindings
    resolve-records.ts     # Multi-type resolve orchestration (injectable resolvers)
  parsers/
    a.ts, aaaa.ts, cname.ts, txt.ts, mx.ts
    format.ts              # formatRecordByType + generic fallback
  crtsh/
    client.ts              # crt.sh HTTP client (fetch injectable for tests)
  axfr/
    encode-query.ts        # DNS AXFR query packet builder
    probe.ts               # TCP AXFR probe + checkZoneTransfer (deps injectable)
  reporters/
    json.ts                # JSON payloads for --json
    table.ts               # Chalk table output for TTY
tests/
  *.test.ts                # Unit tests (mocks/fixtures only)
  *.integration.test.ts    # Live DNS (npm run test:integration)
```

## Data flow

1. **records / recon** — `resolveRecords` calls per-type resolvers, then reporters format via `formatRecordByType`.
2. **subdomains** — `fetchCrtShSubdomains` queries crt.sh; `extractSubdomainsFromRows` filters to the apex zone.
3. **axfr** — NS records from DNS, resolve to IPv4, `queryAxfrOverTcp` with `encodeAxfrQuery`; misconfiguration if response data is returned.
4. **recon** — Combines the three paths; JSON via `reporters/json.ts`.

## Develop

```bash
npm install
npm run build
npm test
npm run test:integration   # optional live DNS
```

## Deep bar

This repo targets HackerX `org-standards/verify-deep.sh`: at least 12 non-test `.ts` files under `src/` and at least 6 `*.test.ts` files.

See [SECURITY.md](./SECURITY.md) for authorized use.
