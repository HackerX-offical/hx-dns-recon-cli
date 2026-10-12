import { axfrJson, recordsJson, reconJson } from '../src/reporters/json.js';

describe('JSON reporters', () => {
  it('serializes records payload', () => {
    const out = recordsJson('example.com', [{ type: 'A', values: ['1.2.3.4'] }]);
    expect(JSON.parse(out)).toEqual({
      domain: 'example.com',
      records: [{ type: 'A', values: ['1.2.3.4'] }],
    });
  });

  it('serializes AXFR results', () => {
    const out = axfrJson('example.com', [{ nameserver: 'ns1.example.com', vulnerable: false }]);
    expect(JSON.parse(out).results).toHaveLength(1);
  });

  it('serializes full recon payload', () => {
    const out = reconJson({
      domain: 'example.com',
      records: [],
      subdomains: ['www.example.com'],
      axfr: [],
    });
    expect(JSON.parse(out).subdomains).toEqual(['www.example.com']);
  });
});
