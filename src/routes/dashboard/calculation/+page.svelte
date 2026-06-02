<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const today = new Date().toISOString().split('T')[0];
	let selectedDate = $state(today);
	let isSubmitting = $state(false);

	$effect(() => {
		if (!form) return;
		if (form.success) {
			toast.success(
				`${form.created} kamat sikeresen rögzítve.${form.failed ? ` ${form.failed} sikertelen.` : ''}`
			);
		}
		if (form.error) {
			toast.error(form.error as string);
		}
	});

	const totalDeposits = $derived(data.rows.reduce((s, r) => s + r.depositValue, 0));
	const totalInterest = $derived(data.rows.reduce((s, r) => s + r.interestValue, 0));

	function formatMoney(v: number): string {
		return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function formatDate(iso: string): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('hu-HU');
	}
</script>

<div class="space-y-6">
	<form
		method="POST"
		action="?/writeInterests"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				isSubmitting = false;
				await update();
			};
		}}
	>
		<Card.Root>
			<Card.Header>
				<Card.Title>Kamat számítás</Card.Title>
				<Card.Description>
					Az alábbi táblázat minden aktív befizetés havi kamatát mutatja (évi 9% / 12).
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<!-- Date selector -->
				<div class="flex flex-wrap items-end gap-4">
					<div class="flex flex-col gap-1.5">
						<Label for="startofterm">Kamat dátuma <span class="text-destructive">*</span></Label>
						<Input
							id="startofterm"
							name="startofterm"
							type="date"
							bind:value={selectedDate}
							class="w-48"
						/>
					</div>
					<Button type="submit" disabled={isSubmitting || data.rows.length === 0}>
						{#if isSubmitting}
							<svg
								class="mr-2 h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								></path>
							</svg>
							Rögzítés…
						{:else}
							Összes kamat rögzítése
						{/if}
					</Button>
				</div>

				<!-- Table -->
				{#if data.rows.length === 0}
					<p class="text-sm text-muted-foreground">Nincsenek befizetések.</p>
				{:else}
					<div class="mt-8 overflow-x-auto rounded-md border">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b bg-muted/50">
									<th class="px-4 py-3 text-left font-medium text-muted-foreground">Ügyfél neve</th>
									<th class="px-4 py-3 text-left font-medium text-muted-foreground"
										>Befizetés dátuma</th
									>
									<th class="px-4 py-3 text-right font-medium text-muted-foreground"
										>Befizetés összege</th
									>
									<th class="px-4 py-3 text-right font-medium text-muted-foreground"
										>Havi kamat (9% / 12)</th
									>
								</tr>
							</thead>
							<tbody>
								{#each data.rows as row}
									<tr class="border-b last:border-0">
										<td class="px-4 py-3 font-medium">{row.clientName}</td>
										<td class="px-4 py-3 text-muted-foreground"
											>{formatDate(row.depositStartofterm)}</td
										>
										<td class="px-4 py-3 text-right text-green-700 tabular-nums">
											{formatMoney(row.depositValue)}
										</td>
										<td class="px-4 py-3 text-right font-medium text-blue-700 tabular-nums">
											{formatMoney(row.interestValue)}
										</td>
									</tr>
								{/each}
							</tbody>
							<tfoot>
								<tr class="border-t bg-muted/30">
									<td class="px-4 py-3 font-semibold" colspan="2">Összesen</td>
									<td class="px-4 py-3 text-right font-semibold text-green-700 tabular-nums">
										{formatMoney(totalDeposits)}
									</td>
									<td class="px-4 py-3 text-right font-semibold text-blue-700 tabular-nums">
										{formatMoney(totalInterest)}
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</form>
</div>
