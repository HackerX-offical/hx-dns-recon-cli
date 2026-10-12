export function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/\.$/, '');
}
