<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, type CauseGroup, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // Where each problem has its own ticket.
  let { ticket, repo, tickets }: { ticket: number; repo: string; tickets: Partial<Record<CauseGroup['cause'], number>> } = $props();

  const LABEL: Record<CauseGroup['cause'], string> = {
    parser: 'Shared parser reads day-first dates month first',
    hint: 'booking-v3 hint asks day-first tenants for month first',
    'one-day-move': 'Date moves by one day',
    unplaced: 'No tenant on file',
  };

  const rows = reports as Report[];
  const merged = $derived(uniqueById(rows).filter((r) => r.mergedInto === ticket));
  const repeats = $derived(rows.filter((r) => r.mergedInto === ticket).length - merged.length);
  const groups = $derived(groupByCause(merged, tenantOf, notes.oneDayMove));
  const tags = (g: CauseGroup) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong> problems · {repeats} repeated rows in the export not counted
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      {@const n = tickets[g.cause]}
      <tr>
        <td>{LABEL[g.cause]}</td>
        <td>{g.reports.length}</td>
        <td class="tags">{tags(g)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if n}<a href="{repo}/issues/{n}">#{n}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
</style>
