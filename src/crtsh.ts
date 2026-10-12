export interface CrtShEntry {
  name: string;
  issuer?: string;
  notBefore?: string;
  notAfter?: string;
}

export async function fetchCrtShSubdomains(
  domain: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string[]> {
  const normalized = domain.toLowerCase().replace(/\.$/, '');
  const url = `https://crt.sh/?q=${encodeURIComponent(`%.${normalized}`)}&output=json`;

  const res = await fetchImpl(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'hx-dns-recon-cli/1.0' },
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    throw new Error(`crt.sh HTTP ${res.status}`);
  }

  const text = await res.text();
  if (!text.trim()) return [];

  let rows: Array<{ common_name?: string; name_value?: string }>;
  try {
    rows = JSON.parse(text) as Array<{ common_name?: string; name_value?: string }>;
  } catch {
    throw new Error('crt.sh returned invalid JSON');
  }

  const names = new Set<string>();
  for (const row of rows) {
    const blob = row.name_value ?? row.common_name ?? '';
    for (const part of blob.split('\n')) {
      const n = part.trim().toLowerCase().replace(/^\*\./, '');
      if (!n) continue;
      if (n === normalized || n.endsWith(`.${normalized}`)) {
        names.add(n);
      }
    }
  }

  return [...names].sort();
}
