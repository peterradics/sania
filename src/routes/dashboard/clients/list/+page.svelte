<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-4xl py-6">
	<div class="mb-6">
		<h1 class="text-2xl font-bold">Clients</h1>
		<p class="text-muted-foreground text-sm">Click a client to view and edit their details.</p>
	</div>

	{#if data.clients.length === 0}
		<p class="text-muted-foreground">No clients found.</p>
	{:else}
		<div class="rounded-md border">
			<table class="w-full text-sm">
				<thead>
					<tr class="bg-muted/50 border-b">
						<th class="px-4 py-3 text-left font-medium">System ID</th>
						<th class="px-4 py-3 text-left font-medium">Name</th>
					</tr>
				</thead>
				<tbody>
					{#each data.clients as client}
						<tr
							class="hover:bg-muted/40 cursor-pointer border-b last:border-0 transition-colors"
							onclick={() => goto(`/dashboard/clients/${client.id}`)}
						>
							<td class="px-4 py-3 tabular-nums">{client.system_id ?? '—'}</td>
							<td class="px-4 py-3">{client.name_first} {client.name_last}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
