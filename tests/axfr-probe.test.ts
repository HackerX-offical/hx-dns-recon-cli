import { checkZoneTransfer } from '../src/axfr/probe.js';

describe('checkZoneTransfer', () => {
  it('reports no NS when resolveNs fails', async () => {
    const results = await checkZoneTransfer('example.com', {
      resolveNs: async () => {
        throw new Error('ENOTFOUND');
      },
      resolve4: async () => [],
      queryAxfr: async () => [],
    });
    expect(results).toEqual([{ nameserver: '(none)', vulnerable: false, error: 'No NS records' }]);
  });

  it('marks vulnerable when AXFR returns data', async () => {
    const results = await checkZoneTransfer('example.com', {
      resolveNs: async () => ['ns1.example.com'],
      resolve4: async () => ['192.0.2.1'],
      queryAxfr: async () => ['deadbeef'],
    });
    expect(results[0]).toMatchObject({
      nameserver: 'ns1.example.com',
      vulnerable: true,
      recordCount: 1,
    });
  });

  it('treats REFUSED as safe', async () => {
    const results = await checkZoneTransfer('example.com', {
      resolveNs: async () => ['ns1.example.com'],
      resolve4: async () => ['192.0.2.1'],
      queryAxfr: async () => {
        throw new Error('REFUSED');
      },
    });
    expect(results[0]).toMatchObject({
      nameserver: 'ns1.example.com',
      vulnerable: false,
      error: 'REFUSED',
    });
  });
});
