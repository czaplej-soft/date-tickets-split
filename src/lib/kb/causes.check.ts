// Run: npm run check:counts. Fails if the split of #4471 stops adding up.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { groupByCause, uniqueById, type Report, type Tenant } from './causes.ts';

const read = (p: string) => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const tenants: Tenant[] = readdirSync(new URL('../data/tenants/', import.meta.url)).map((f) => read(`tenants/${f}`));
const tenantOf = (r: Report) => tenants.find((t) => t.handle === r.tenant);
const reports = uniqueById(read('reports-4471.json') as Report[]);
const count = (ids: string[] = []) =>
  Object.fromEntries(groupByCause(reports, tenantOf, ids).map((g) => [g.cause, g.reports.length]));

assert.equal(reports.length, 412);
assert.deepEqual(count(), { parser: 379, hint: 33 });
assert.deepEqual(count(read('desk-notes.json').oneDayMove), { parser: 374, hint: 33, 'one-day-move': 5 });
console.log('counts ok');
