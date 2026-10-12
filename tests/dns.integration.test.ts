import { resolveRecords } from '../src/resolvers/resolve-records.js';

describe('resolveRecords (live)', () => {
  it('resolves A/NS for example.com', async () => {
    const records = await resolveRecords('example.com', ['A', 'NS']);
    const a = records.find((r) => r.type === 'A');
    const ns = records.find((r) => r.type === 'NS');
    expect(a?.values).toBeDefined();
    expect(Array.isArray(a?.values)).toBe(true);
    expect((a?.values as string[]).length).toBeGreaterThan(0);
    expect((ns?.values as string[]).length).toBeGreaterThan(0);
  });
});
