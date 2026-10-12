import chalk from 'chalk';
import type { AxfrResult, DnsRecordResult } from '../types.js';
import { formatRecordByType } from '../parsers/format.js';

export function printDnsRecords(domain: string, records: DnsRecordResult[]): void {
  console.log(chalk.bold(`\n${domain}\n`));
  for (const r of records) {
    const label = chalk.cyan(r.type.padEnd(5));
    if (r.error && (r.values as unknown[]).length === 0) {
      console.log(`${label} ${chalk.dim(r.error)}`);
    } else {
      console.log(`${label} ${formatRecordByType(r.type, r.values)}`);
    }
  }
}

export function printSubdomainList(subdomains: string[], limit = 25): void {
  console.log(chalk.bold(`\nSubdomains (CT): ${subdomains.length}`));
  subdomains.slice(0, limit).forEach((s) => console.log(`  ${s}`));
  if (subdomains.length > limit) {
    console.log(chalk.dim(`  ... and ${subdomains.length - limit} more`));
  }
}

export function printAxfrResults(results: AxfrResult[], indent = ''): void {
  for (const r of results) {
    const status = r.vulnerable ? chalk.red('VULNERABLE') : chalk.green('refused/ok');
    const err = r.error ? chalk.dim(` (${r.error})`) : '';
    console.log(`${indent}${r.nameserver}: ${status}${err}`);
  }
}

export function printAxfrCheck(results: AxfrResult[]): void {
  for (const r of results) {
    const status = r.vulnerable ? chalk.red('VULNERABLE') : chalk.green('OK');
    console.log(`${r.nameserver}: ${status}${r.error ? chalk.dim(` (${r.error})`) : ''}`);
  }
}
