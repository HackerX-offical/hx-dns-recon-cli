#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import { fetchCrtShSubdomains } from './crtsh/client.js';
import { checkZoneTransfer } from './axfr/probe.js';
import { resolveRecords } from './resolvers/resolve-records.js';
import {
  axfrJson,
  printAxfrCheck,
  printAxfrResults,
  printDnsRecords,
  printSubdomainList,
  recordsJson,
  reconJson,
  subdomainsJson,
} from './reporters/index.js';

const program = new Command();

program
  .name('hx-dns')
  .description('DNS reconnaissance for authorized assessments')
  .version('1.0.0');

program
  .command('records')
  .description('Resolve standard DNS records')
  .argument('<domain>', 'apex domain')
  .option('--json', 'JSON output')
  .action(async (domain: string, opts: { json?: boolean }) => {
    const spinner = ora('Resolving DNS').start();
    try {
      const records = await resolveRecords(domain);
      spinner.stop();
      if (opts.json) {
        console.log(recordsJson(domain, records));
      } else {
        printDnsRecords(domain, records);
      }
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program
  .command('subdomains')
  .description('Enumerate subdomains via Certificate Transparency (crt.sh)')
  .argument('<domain>', 'apex domain')
  .option('--json', 'JSON output')
  .action(async (domain: string, opts: { json?: boolean }) => {
    const spinner = ora('Querying crt.sh').start();
    try {
      const subs = await fetchCrtShSubdomains(domain);
      spinner.succeed(`Found ${subs.length} names`);
      if (opts.json) {
        console.log(subdomainsJson(domain, subs));
      } else {
        subs.forEach((s) => console.log(s));
      }
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program
  .command('axfr')
  .description('Check nameservers for zone transfer (AXFR) misconfiguration')
  .argument('<domain>', 'apex domain')
  .option('--json', 'JSON output')
  .action(async (domain: string, opts: { json?: boolean }) => {
    const spinner = ora('Testing AXFR on NS records').start();
    try {
      const results = await checkZoneTransfer(domain);
      spinner.stop();
      if (opts.json) {
        console.log(axfrJson(domain, results));
      } else {
        printAxfrCheck(results);
      }
      if (results.some((r) => r.vulnerable)) process.exit(2);
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program
  .command('recon')
  .description('Full DNS recon: records + CT subdomains + AXFR check')
  .argument('<domain>', 'apex domain')
  .option('--json', 'JSON output')
  .option('--no-ct', 'skip crt.sh subdomain pass')
  .action(async (domain: string, opts: { json?: boolean; ct?: boolean }) => {
    const spinner = ora('Running DNS recon').start();
    try {
      const records = await resolveRecords(domain);
      spinner.text = 'Certificate Transparency';
      const subdomains = opts.ct === false ? [] : await fetchCrtShSubdomains(domain);
      spinner.text = 'Zone transfer check';
      const axfr = await checkZoneTransfer(domain);
      spinner.succeed('Done');

      const payload = { domain, records, subdomains, axfr };

      if (opts.json) {
        console.log(reconJson(payload));
        return;
      }

      printDnsRecords(domain, records);
      printSubdomainList(subdomains);
      console.log('\nAXFR');
      printAxfrResults(axfr, '  ');
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse();
