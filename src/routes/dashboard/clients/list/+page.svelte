<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const totalBalance = $derived(Object.values(data.balanceByClient).reduce((sum, v) => sum + v, 0));
	const clientCount = $derived(data.clients.length);

	type SortKey = 'system_id' | 'name' | 'balance' | 'first_deposit' | 'first_deposit_date';
	let sortKey = $state<SortKey>('system_id');
	let sortDir = $state<'asc' | 'desc'>('asc');

	function toggleSort(key: SortKey) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}
	}

	const sortedClients = $derived.by(() => {
		return [...data.clients].sort((a, b) => {
			const fd_a = data.firstDepositByClient[a.id];
			const fd_b = data.firstDepositByClient[b.id];
			let cmp = 0;

			if (sortKey === 'system_id') {
				cmp = (a.system_id ?? Infinity) - (b.system_id ?? Infinity);
			} else if (sortKey === 'name') {
				const nameA = `${a.name_last} ${a.name_first}`.toLowerCase();
				const nameB = `${b.name_last} ${b.name_first}`.toLowerCase();
				cmp = nameA.localeCompare(nameB);
			} else if (sortKey === 'balance') {
				cmp = (data.balanceByClient[a.id] ?? 0) - (data.balanceByClient[b.id] ?? 0);
			} else if (sortKey === 'first_deposit') {
				cmp = (fd_a?.value ?? -Infinity) - (fd_b?.value ?? -Infinity);
			} else if (sortKey === 'first_deposit_date') {
				const da = fd_a?.startofterm ? new Date(fd_a.startofterm).getTime() : Infinity;
				const db = fd_b?.startofterm ? new Date(fd_b.startofterm).getTime() : Infinity;
				cmp = da - db;
			}

			return sortDir === 'asc' ? cmp : -cmp;
		});
	});

	function formatMoney(v: number): string {
		return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="mx-auto max-w-4xl py-6">
	<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">Ügyfelek</h1>
			<p class="text-sm text-muted-foreground">
				Kattintson egy ügyfélre az adatok megtekintéséhez és szerkesztéséhez.
			</p>
		</div>
		<div class="text-right">
			<p class="text-xs tracking-wide text-muted-foreground uppercase">Összes kezelt vagyon</p>
			<p
				class="text-2xl font-semibold tabular-nums {totalBalance >= 0
					? 'text-green-700'
					: 'text-red-700'}"
			>
				{formatMoney(totalBalance)}
			</p>
			<p class="text-xs text-muted-foreground">
				{clientCount} ügyfél
			</p>
		</div>
	</div>

	{#if data.clients.length === 0}
		<p class="text-muted-foreground">Nincsenek ügyfelek.</p>
	{:else}
		<div class="overflow-x-auto rounded-md border">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b bg-muted/50">
						{#snippet th(key: SortKey, label: string, align: 'left' | 'right' = 'left')}
							<th
								class="cursor-pointer px-4 py-3 select-none text-{align} font-medium hover:text-foreground {sortKey ===
								key
									? 'text-foreground'
									: 'text-muted-foreground'}"
								onclick={() => toggleSort(key)}
							>
								{label}{sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
							</th>
						{/snippet}
						{@render th('system_id', 'Azonosító')}
						{@render th('name', 'Név')}
						{@render th('balance', 'Egyenleg', 'right')}
						{@render th('first_deposit', '1. Befizetés', 'right')}
						{@render th('first_deposit_date', '1. Befizetés dátuma', 'right')}
					</tr>
				</thead>
				<tbody>
					{#each sortedClients as client}
						{@const balance = data.balanceByClient[client.id] ?? 0}
						{@const firstDeposit = data.firstDepositByClient[client.id]}
						<tr
							class="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40"
							onclick={() => goto(`/dashboard/clients/${client.id}`)}
						>
							<td class="px-4 py-3 tabular-nums">{client.system_id ?? '—'}</td>
							<td class="px-4 py-3">{client.name_first} {client.name_last}</td>
							<td
								class="px-4 py-3 text-right tabular-nums {balance >= 0
									? 'text-green-700'
									: 'text-red-700'} font-medium"
							>
								{formatMoney(balance)}
							</td>
							<td class="px-4 py-3 text-right font-medium tabular-nums">
								{firstDeposit ? formatMoney(firstDeposit.value) : '—'}
							</td>
							<td class="px-4 py-3 text-right text-muted-foreground tabular-nums">
								{firstDeposit ? formatDate(firstDeposit.startofterm) : '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
