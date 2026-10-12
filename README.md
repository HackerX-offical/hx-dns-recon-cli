# hx-dns-recon-cli

CLI DNS recon for **authorized** assessments: record resolution, Certificate
Transparency subdomains, and AXFR misconfiguration checks.

## Install

```bash
npm install
npm run build
```

## Commands

| Command                      | Description                |
| ---------------------------- | -------------------------- |
| `hx-dns records <domain>`    | A, AAAA, MX, TXT, NS, SOA  |
| `hx-dns subdomains <domain>` | Subdomains from crt.sh     |
| `hx-dns axfr <domain>`       | Zone transfer check per NS |
| `hx-dns recon <domain>`      | All of the above           |

```bash
hx-dns recon example.com --json
hx-dns subdomains example.com
```

Pair with
[hx-scope-enforcer-cli](https://github.com/HackerX-offical/hx-scope-enforcer-cli) before
scanning.

## Tests

```bash
npm test
npm run test:integration   # live DNS against example.com
```

MIT — HackerX Official
