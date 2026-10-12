#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { fetchCrtShSubdomains } from './crtsh.js';
import { checkZoneTransfer } from './axfr.js';
import { formatRecordValue, resolveRecords } from './dns.js';

const program = new Command();

program
  .name('hx-dns')
  .description('DNS reconnaissance for authorized assessments')
  .version('1.0.0');

function printRecords(
  domain: string,
  records: Awaited<ReturnType<typeof resolveRecords>>,
  json: boolean,
) {
  if (json) {
    console.log(JSON.stringify({ domain, records }, null, 2));
    return;
  }
  console.log(chalk.bold(`\n${domain}\n`));
  for (const r of records) {
    const label = chalk.cyan(r.type.padEnd(5));
    if (r.error && (r.values as unknown[]).length === 0) {
      console.log(`${label} ${chalk.dim(r.error)}`);
    } else {
      console.log(`${label} ${formatRecordValue(r.values)}`);
    }
  }
}

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
      printRecords(domain, records, Boolean(opts.json));
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
        console.log(JSON.stringify({ domain, subdomains: subs }, null, 2));
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
        console.log(JSON.stringify({ domain, results }, null, 2));
      } else {
        for (const r of results) {
          const status = r.vulnerable ? chalk.red('VULNERABLE') : chalk.green('OK');
          console.log(`${r.nameserver}: ${status}${r.error ? chalk.dim(` (${r.error})`) : ''}`);
        }
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

      const payload = {
        domain,
        records,
        subdomains,
        axfr,
      };

      if (opts.json) {
        console.log(JSON.stringify(payload, null, 2));
        return;
      }

      printRecords(domain, records, false);
      console.log(chalk.bold(`\nSubdomains (CT): ${subdomains.length}`));
      subdomains.slice(0, 25).forEach((s) => console.log(`  ${s}`));
      if (subdomains.length > 25) {
        console.log(chalk.dim(`  ... and ${subdomains.length - 25} more`));
      }
      console.log(chalk.bold('\nAXFR'));
      for (const r of axfr) {
        const status = r.vulnerable ? chalk.red('VULNERABLE') : chalk.green('refused/ok');
        console.log(`  ${r.nameserver}: ${status}`);
      }
    } catch (err) {
      spinner.fail(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse();
