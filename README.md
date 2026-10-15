# hx-dns-recon-cli

**DNS reconnaissance for authorized assessments** — records, CT subdomains, AXFR checks,
and combined `recon` in one CLI.

## Why this exists

External attack surface mapping starts with DNS and certificate transparency. This tool
packages resolver queries, crt.sh enumeration, and zone-transfer probes with consistent
JSON and human-readable output for pipelines and reports. Use only on domains you are
authorized to assess.

## Features

- `records` — A, AAAA, MX, TXT, CNAME, NS via Node resolver
- `subdomains` — Certificate Transparency pass via crt.sh
- `axfr` — Nameserver zone-transfer misconfiguration check (exit `2` if vulnerable)
- `recon` — Records + CT + AXFR in one run (`--no-ct` to skip crt.sh)
- `--json` on every command for automation

## Install

```bash
git clone https://github.com/HackerX-official/hx-dns-recon-cli.git
cd hx-dns-recon-cli
npm install
npm run build
npm link   # optional: global hx-dns
```

## Quick start

```bash
hx-dns records example.com
hx-dns subdomains example.com --json
hx-dns axfr example.com
hx-dns recon example.com --json
```

## Output

| Mode     | Description                                                                                |
| -------- | ------------------------------------------------------------------------------------------ |
| Default  | Sectioned tables (records, subdomain list, AXFR lines)                                     |
| `--json` | Structured payloads per command (`recordsJson`, `subdomainsJson`, `axfrJson`, `reconJson`) |
| Exit `2` | `axfr`: at least one nameserver allowed zone transfer                                      |

## Develop

```bash
npm run format
npm run build
npm test
npm run test:integration   # optional live DNS targets
npm run format:check
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module layout and extension points.

## Ethics

Use only on systems and content you are **authorized** to test. See
[SECURITY.md](./SECURITY.md).

## License

Licensed under the [HackerX License](./LICENSE). Redistributions must retain copyright,
license text, and [NOTICE](./NOTICE) attribution per the license terms.
