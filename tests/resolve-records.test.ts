import { resolveRecords } from '../src/resolvers/resolve-records.js';

describe('resolveRecords', () => {
  it('uses injected resolvers without network I/O', async () => {
    const results = await resolveRecords('example.com', ['A', 'TXT'], {
      resolvers: {
        A: async () => ['93.184.216.34'],
        TXT: async () => [['hello']],
      },
    });

    expect(results).toEqual([
      { type: 'A', values: ['93.184.216.34'] },
      { type: 'TXT', values: [['hello']] },
    ]);
  });

  it('maps ENODATA to empty values with error code', async () => {
    const err = Object.assign(new Error('no data'), { code: 'ENODATA' });
    const results = await resolveRecords('example.com', ['CNAME'], {
      resolvers: {
        CNAME: async () => {
          throw err;
        },
      },
    });

    expect(results[0]).toEqual({ type: 'CNAME', values: [], error: 'ENODATA' });
  });
});
