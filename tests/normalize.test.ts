import { normalizeDomain } from '../src/resolvers/normalize.js';

describe('normalizeDomain', () => {
  it('lowercases and strips trailing dot', () => {
    expect(normalizeDomain('Example.COM.')).toBe('example.com');
  });
});
