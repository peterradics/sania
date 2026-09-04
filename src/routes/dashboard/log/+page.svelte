<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(iso: string): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleString('hu-HU');
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold">Napló</h1>
		<p class="text-sm text-muted-foreground">Bejelentkezési előzmények.</p>
	</div>

	<div class="overflow-x-auto rounded-xl border shadow-sm">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Név / E-mail</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Első bejelentkezés</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Utolsó bejelentkezés</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Eredmény</th>
				</tr>
			</thead>
			<tbody>
				{#if data.entries.length === 0}
					<tr>
						<td colspan="4" class="px-4 py-6 text-center text-muted-foreground">
							Még nincs bejegyzés.
						</td>
					</tr>
				{:else}
					{#each data.entries as entry}
						<tr class="border-b last:border-0">
							<td class="px-4 py-3">
								<p class="font-medium">{entry.name || entry.email}</p>
								{#if entry.name}
									<p class="text-xs text-muted-foreground">{entry.email}</p>
								{/if}
							</td>
							<td class="px-4 py-3 text-muted-foreground">{formatDate(entry.created)}</td>
							<td class="px-4 py-3 text-muted-foreground">{formatDate(entry.updated)}</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
								>Sikeres</span>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
