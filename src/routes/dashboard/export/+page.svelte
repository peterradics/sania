<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatMoney(v: number | string): string {
		if (v === '' || v === null || v === undefined) return '—';
		return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function formatDate(iso: string): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('hu-HU');
	}

	function downloadCSV() {
		const headers = ['system_id', 'full name', 'email', 'first deposit value', 'first deposit date'];
		const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

		const lines = [
			headers.map(escape).join(','),
			...data.rows.map((r) =>
				[r.system_id, r.full_name, r.email, r.first_deposit_value, r.first_deposit_date]
					.map(escape)
					.join(',')
			)
		];

		const csv = lines.join('\r\n');
		const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">Export</h1>
			<p class="text-sm text-muted-foreground">{data.rows.length} ügyfél exportálásra kész.</p>
		</div>
		<Button onclick={downloadCSV} disabled={data.rows.length === 0}>
			<DownloadIcon class="mr-2 h-4 w-4" />
			CSV letöltése
		</Button>
	</div>

	<div class="overflow-x-auto rounded-xl border shadow-sm">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Azonosító</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Teljes név</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">E-mail</th>
					<th class="px-4 py-3 text-right font-medium text-muted-foreground">1. Befizetés</th>
					<th class="px-4 py-3 text-right font-medium text-muted-foreground">1. Befizetés dátuma</th>
				</tr>
			</thead>
			<tbody>
				{#if data.rows.length === 0}
					<tr>
						<td colspan="5" class="px-4 py-6 text-center text-muted-foreground">
							Nincsenek ügyfelek.
						</td>
					</tr>
				{:else}
					{#each data.rows as row}
						<tr class="border-b last:border-0">
							<td class="px-4 py-3 tabular-nums text-muted-foreground">{row.system_id || '—'}</td>
							<td class="px-4 py-3 font-medium">{row.full_name}</td>
							<td class="px-4 py-3 text-muted-foreground">{row.email || '—'}</td>
							<td class="px-4 py-3 text-right tabular-nums text-green-700">
								{formatMoney(row.first_deposit_value)}
							</td>
							<td class="px-4 py-3 text-right text-muted-foreground">
								{formatDate(row.first_deposit_date)}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
