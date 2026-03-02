<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: Record<string, unknown> | null } = $props();

	let isClientLoading = $state(false);
	let isMoneyLoading = $state(false);
	let moneyType = $state('deposit');

	$effect(() => {
		if (!form) return;
		if (form._action === 'updateClient') {
			if (form.serverError) toast.error(form.serverError as string);
			if (form.success) toast.success('Client saved successfully!');
		}
		if (form._action === 'createMoney') {
			if (form.moneyServerError) toast.error(form.moneyServerError as string);
			if (form.success) toast.success('Money entry added successfully!');
		}
	});

	function handleClientSubmit() {
		return () => {
			isClientLoading = true;
			return async ({ update }: { update: (opts?: { reset: boolean }) => Promise<void> }) => {
				isClientLoading = false;
				await update({ reset: false });
			};
		};
	}

	function handleMoneySubmit() {
		return () => {
			isMoneyLoading = true;
			return async ({
				result,
				update
			}: {
				result: { type: string };
				update: (opts?: { reset: boolean }) => Promise<void>;
			}) => {
				isMoneyLoading = false;
				if (result.type === 'success') moneyType = 'deposit';
				await update();
			};
		};
	}

	type StrMap = Record<string, string | undefined>;

	const clientValues = $derived.by((): StrMap => {
		if (form?._action === 'updateClient' && form?.values) return form.values as StrMap;
		const c = data.client;
		return {
			name_first: c.name_first ?? '',
			name_last: c.name_last ?? '',
			email: c.email ?? '',
			phone_number: c.phone_number ?? '',
			system_id: c.system_id != null ? String(c.system_id) : '',
			adress_street: c.adress_street ?? '',
			address_zip: c.address_zip ?? '',
			address_city: c.address_city ?? '',
			address_country: c.address_country ?? '',
			birth_place: c.birth_place ?? '',
			birth_date: c.birth_date ? c.birth_date.split(' ')[0] : ''
		};
	});

	const clientErrors = $derived(
		form?._action === 'updateClient' ? ((form?.errors ?? {}) as StrMap) : ({} as StrMap)
	);

	const moneyValues = $derived(
		form?._action === 'createMoney' ? ((form?.moneyValues ?? {}) as StrMap) : ({} as StrMap)
	);
	const moneyErrors = $derived(
		form?._action === 'createMoney' ? ((form?.moneyErrors ?? {}) as StrMap) : ({} as StrMap)
	);

	const deposits = $derived(
		(data.moneyEntries as Array<Record<string, unknown>>).filter((e) => e.type === 'deposit')
	);
	const depositsById = $derived(
		new Map(
			(deposits as Array<{ id: string; value: number; created: string }>).map((d) => [d.id, d])
		)
	);

	const totalDeposits = $derived(
		(data.moneyEntries as Array<{ type: string; value: number }>)
			.filter((e) => e.type === 'deposit')
			.reduce((sum, e) => sum + (e.value ?? 0), 0)
	);
	const totalWithdrawals = $derived(
		(data.moneyEntries as Array<{ type: string; value: number }>)
			.filter((e) => e.type === 'withdraw')
			.reduce((sum, e) => sum + (e.value ?? 0), 0)
	);
	const netBalance = $derived(totalDeposits - totalWithdrawals);

	function formatDate(d: string): string {
		if (!d) return '—';
		return new Date(d).toLocaleDateString();
	}

	function formatMoney(v: number): string {
		return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	const selectClass =
		'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50';
</script>

<div class="mx-auto py-6">
	<div class="mb-6">
		<h1 class="text-2xl font-bold">Edit Client</h1>
		<p class="text-sm text-muted-foreground">Update the client's details below.</p>
	</div>

	<!-- ── Client form ── -->
	<form method="POST" action="?/updateClient" use:enhance={handleClientSubmit()}>
		<Card.Root>
			<Card.Header>
				<Card.Title>Personal Information</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex flex-col gap-1.5">
					<Label for="name_first">First Name <span class="text-destructive">*</span></Label>
					<Input
						id="name_first"
						name="name_first"
						placeholder="Jane"
						value={clientValues.name_first ?? ''}
						aria-invalid={!!clientErrors.name_first}
					/>
					{#if clientErrors.name_first}<p class="text-xs text-destructive">
							{clientErrors.name_first}
						</p>{/if}
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="name_last">Last Name <span class="text-destructive">*</span></Label>
					<Input
						id="name_last"
						name="name_last"
						placeholder="Doe"
						value={clientValues.name_last ?? ''}
						aria-invalid={!!clientErrors.name_last}
					/>
					{#if clientErrors.name_last}<p class="text-xs text-destructive">
							{clientErrors.name_last}
						</p>{/if}
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="jane.doe@example.com"
						value={clientValues.email ?? ''}
						aria-invalid={!!clientErrors.email}
					/>
					{#if clientErrors.email}<p class="text-xs text-destructive">{clientErrors.email}</p>{/if}
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="phone_number">Phone Number</Label>
					<Input
						id="phone_number"
						name="phone_number"
						type="tel"
						placeholder="+1 555 000 0000"
						value={clientValues.phone_number ?? ''}
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="system_id">System ID</Label>
					<Input
						id="system_id"
						name="system_id"
						type="number"
						placeholder="12345"
						value={clientValues.system_id ?? ''}
						aria-invalid={!!clientErrors.system_id}
					/>
					{#if clientErrors.system_id}<p class="text-xs text-destructive">
							{clientErrors.system_id}
						</p>{/if}
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="birth_date">Birth Date</Label>
					<Input
						id="birth_date"
						name="birth_date"
						type="date"
						value={clientValues.birth_date ?? ''}
					/>
				</div>
				<div class="col-span-full flex flex-col gap-1.5">
					<Label for="birth_place">Birth Place</Label>
					<Input
						id="birth_place"
						name="birth_place"
						placeholder="City, Country"
						value={clientValues.birth_place ?? ''}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="mt-4">
			<Card.Header><Card.Title>Address</Card.Title></Card.Header>
			<Card.Content class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="col-span-full flex flex-col gap-1.5">
					<Label for="adress_street">Street</Label>
					<Input
						id="adress_street"
						name="adress_street"
						placeholder="123 Main St"
						value={clientValues.adress_street ?? ''}
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="address_zip">ZIP / Postal Code</Label>
					<Input
						id="address_zip"
						name="address_zip"
						placeholder="10001"
						value={clientValues.address_zip ?? ''}
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<Label for="address_city">City</Label>
					<Input
						id="address_city"
						name="address_city"
						placeholder="New York"
						value={clientValues.address_city ?? ''}
					/>
				</div>
				<div class="col-span-full flex flex-col gap-1.5">
					<Label for="address_country">Country</Label>
					<Input
						id="address_country"
						name="address_country"
						placeholder="United States"
						value={clientValues.address_country ?? ''}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="mt-4 flex items-center justify-end gap-3">
			<Button type="button" variant="outline" onclick={() => goto('/dashboard/clients/list')}
				>Back to List</Button
			>
			<Button type="submit" disabled={isClientLoading}>
				{#if isClientLoading}
					<svg
						class="mr-2 h-4 w-4 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						></path>
					</svg>
					Saving…
				{:else}
					Save Client
				{/if}
			</Button>
		</div>
	</form>

	<!-- ── Money entry form ── -->
	<form method="POST" action="?/createMoney" use:enhance={handleMoneySubmit()} class="mt-8">
		<Card.Root>
			<Card.Header>
				<Card.Title>Add Money Entry</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<!-- Type -->
				<div class="flex flex-col gap-1.5">
					<Label for="money_type">Type <span class="text-destructive">*</span></Label>
					<select id="money_type" name="type" bind:value={moneyType} class={selectClass}>
						<option value="deposit">Deposit</option>
						<option value="withdraw">Withdraw</option>
					</select>
					{#if moneyErrors.type}<p class="text-xs text-destructive">{moneyErrors.type}</p>{/if}
				</div>

				<!-- Value -->
				<div class="flex flex-col gap-1.5">
					<Label for="money_value">Value <span class="text-destructive">*</span></Label>
					<Input
						id="money_value"
						name="value"
						type="number"
						step="0.01"
						placeholder="0.00"
						value={moneyValues.value ?? ''}
						aria-invalid={!!moneyErrors.value}
					/>
					{#if moneyErrors.value}<p class="text-xs text-destructive">{moneyErrors.value}</p>{/if}
				</div>

				<!-- End of Term -->
				<div class="flex flex-col gap-1.5">
					<Label for="money_endofterm">End of Term</Label>
					<Input
						id="money_endofterm"
						name="endofterm"
						type="date"
						value={moneyValues.endofterm ?? ''}
					/>
				</div>

				<!-- Parent deposit (withdraw only) -->
				{#if moneyType === 'withdraw'}
					<div class="flex flex-col gap-1.5">
						<Label for="money_parent">Withdraw From (Deposit)</Label>
						{#if deposits.length === 0}
							<p class="text-sm text-muted-foreground">No deposits available.</p>
						{:else}
							<select id="money_parent" name="parent" class={selectClass}>
								<option value="">— select deposit —</option>
								{#each deposits as d}
									{@const dep = d as {
										id: string;
										value: number;
										created: string;
										endofterm?: string;
									}}
									<option value={dep.id} selected={moneyValues.parent === dep.id}>
										{formatDate(dep.created)} · {formatMoney(dep.value)}{dep.endofterm
											? ` (until ${formatDate(dep.endofterm)})`
											: ''}
									</option>
								{/each}
							</select>
						{/if}
					</div>
				{/if}
			</Card.Content>
			<Card.Footer class="justify-end">
				<Button type="submit" disabled={isMoneyLoading}>
					{#if isMoneyLoading}
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
						Adding…
					{:else}
						Add Entry
					{/if}
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>

	<!-- ── Money entries list ── -->
	<div class="mt-8">
		<h2 class="mb-3 text-lg font-semibold">Money Entries</h2>
		{#if data.moneyEntries.length === 0}
			<p class="text-sm text-muted-foreground">No money entries yet.</p>
		{:else}
			<div class="rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium">Type</th>
							<th class="px-4 py-3 text-right font-medium">Value</th>
							<th class="px-4 py-3 text-left font-medium">End of Term</th>
							<th class="px-4 py-3 text-left font-medium">Parent Deposit</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
						</tr>
					</thead>
					<tbody>
						{#each data.moneyEntries as entry}
							{@const e = entry as {
								id: string;
								type: string;
								value: number;
								endofterm?: string;
								parent?: string;
								created: string;
							}}
							{@const parentDeposit = e.parent ? depositsById.get(e.parent) : undefined}
							<tr class="border-b last:border-0">
								<td class="px-4 py-3">
									{#if e.type === 'deposit'}
										<span
											class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
											>Deposit</span
										>
									{:else}
										<span
											class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
											>Withdraw</span
										>
									{/if}
								</td>
								<td class="px-4 py-3 text-right tabular-nums">{formatMoney(e.value)}</td>
								<td class="px-4 py-3">{formatDate(e.endofterm ?? '')}</td>
								<td class="px-4 py-3 text-xs text-muted-foreground">
									{#if parentDeposit}
										{formatDate(parentDeposit.created)} · {formatMoney(parentDeposit.value)}
									{:else if e.parent}
										{e.parent}
									{:else}
										—
									{/if}
								</td>
								<td class="px-4 py-3 text-muted-foreground">{formatDate(e.created)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- ── Summary ── -->
			<div class="mt-4 rounded-md border p-4">
				<h3 class="mb-3 text-sm font-semibold">Summary</h3>
				<div class="grid grid-cols-3 gap-4 text-center">
					<div>
						<p class="text-xs text-muted-foreground">Total Deposits</p>
						<p class="text-lg font-semibold text-green-700">{formatMoney(totalDeposits)}</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Total Withdrawals</p>
						<p class="text-lg font-semibold text-red-700">{formatMoney(totalWithdrawals)}</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Net Balance</p>
						<p class="text-lg font-semibold {netBalance >= 0 ? 'text-green-700' : 'text-red-700'}">
							{formatMoney(netBalance)}
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
