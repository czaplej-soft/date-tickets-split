// Run: npm run check:counts. Fails if the split of #4471 stops adding up.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from './causes.ts';

const read = (p: string) => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const tenants: Tenant[] = readdirSync(new URL('../data/tenants/', import.meta.url)).map((f) => read(`tenants/${f}`));
const tenantOf = (r: Report) => tenants.find((t) => t.handle === r.tenant);
const reports = uniqueById(read('reports-4471.json') as Report[]);
const groups = groupByCause(reports, tenantOf);
const parser = groups.find((g) => g.cause === 'parser');

assert.equal(reports.length, 412);
assert.deepEqual(Object.fromEntries(groups.map((g) => [g.cause, g.reports.length])), { parser: 379, hint: 33 });
assert.equal(readAs(parser!, read('desk-notes.json').oneDayMove), 5);
console.log('counts ok');
