import { jest } from '@jest/globals';
import { extractSubdomainsFromRows, fetchCrtShSubdomains } from '../src/crtsh/client.js';

describe('extractSubdomainsFromRows', () => {
  it('filters names to the apex zone and strips wildcards', () => {
    const subs = extractSubdomainsFromRows(
      [
        { name_value: 'www.example.com\n*.api.example.com' },
        { common_name: 'other.org' },
      ],
      'example.com',
    );
    expect(subs).toEqual(['api.example.com', 'www.example.com']);
  });
});

describe('fetchCrtShSubdomains', () => {
  it('parses crt.sh JSON and filters to zone', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify([
          { name_value: 'www.example.com\napi.example.com' },
          { common_name: 'other.org' },
        ]),
    });

    const subs = await fetchCrtShSubdomains('example.com', mockFetch as typeof fetch);
    expect(subs).toEqual(['api.example.com', 'www.example.com']);
  });

  it('throws on HTTP errors', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchCrtShSubdomains('example.com', mockFetch as typeof fetch)).rejects.toThrow(
      'crt.sh HTTP 503',
    );
  });
});
