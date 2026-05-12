<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { PageData } from './$types';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import ArrowDownToLineIcon from '@lucide/svelte/icons/arrow-down-to-line';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import UsersIcon from '@lucide/svelte/icons/users';

	let { data }: { data: PageData } = $props();

	function formatMoney(v: number): string {
		return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}
</script>

<div class="space-y-8">
	<!-- ── Summary header ── -->
	<div>
		<h1 class="text-2xl font-bold">Dashboard</h1>
		<p class="text-sm text-muted-foreground">Platform-wide overview</p>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<!-- Total Balance -->
		<Card.Root>
			<Card.Content class="flex items-center gap-4 px-4 py-2">
				<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
					<WalletIcon class="h-5 w-5 text-primary" />
				</div>
				<div>
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Total Balance</p>
					<p
						class="text-2xl font-semibold tabular-nums {data.totalBalance >= 0
							? 'text-green-700'
							: 'text-red-700'}"
					>
						{formatMoney(data.totalBalance)} EUR
					</p>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Total Deposits -->
		<Card.Root>
			<Card.Content class="flex items-center gap-4 px-4 py-2">
				<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
					<ArrowDownToLineIcon class="h-5 w-5 text-green-700" />
				</div>
				<div>
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Total Deposits</p>
					<p class="text-2xl font-semibold text-green-700 tabular-nums">
						{formatMoney(data.totalDeposits)} EUR
					</p>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Total Interest -->
		<Card.Root>
			<Card.Content class="flex items-center gap-4 px-4 py-2">
				<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100">
					<SparklesIcon class="h-5 w-5 text-blue-700" />
				</div>
				<div>
					<p class="text-xs tracking-wide text-muted-foreground uppercase">Total Interest</p>
					<p class="text-2xl font-semibold text-blue-700 tabular-nums">
						{formatMoney(data.totalInterest)}
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- ── Latest clients ── -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center gap-3 pb-2">
			<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
				<UsersIcon class="h-4 w-4 text-primary" />
			</div>
			<div>
				<Card.Title>Latest Clients</Card.Title>
				<Card.Description>Most recently added accounts</Card.Description>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-6 py-3 text-left font-medium text-muted-foreground">System ID</th>
							<th class="px-6 py-3 text-left font-medium text-muted-foreground">Name</th>
							<th class="px-6 py-3 text-right font-medium text-muted-foreground">Balance</th>
						</tr>
					</thead>
					<tbody>
						{#each data.latestClients as raw}
							{@const client = raw as {
								id: string;
								system_id: number | null;
								name_first: string;
								name_last: string;
							}}
							{@const balance = data.balanceByClient[client.id] ?? 0}
							<tr
								class="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/40"
								onclick={() => goto(`/dashboard/clients/${client.id}`)}
							>
								<td class="px-6 py-3 text-muted-foreground tabular-nums">
									{client.system_id ?? '—'}
								</td>
								<td class="px-6 py-3 font-medium">
									{client.name_first}
									{client.name_last}
								</td>
								<td
									class="px-6 py-3 text-right font-medium tabular-nums {balance >= 0
										? 'text-green-700'
										: 'text-red-700'}"
								>
									{formatMoney(balance)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Content>
	</Card.Root>
</div>
