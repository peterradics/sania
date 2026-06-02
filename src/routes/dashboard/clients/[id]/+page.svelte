<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: Record<string, unknown> | null } = $props();

	console.log(data.moneyEntries);
	let isClientLoading = $state(false);
	let isMoneyLoading = $state(false);
	let moneyType = $state('deposit');
	let selectedParentId = $state('');
	let deleteTarget = $state<{ id: string; type: string; value: number } | null>(null);

	$effect(() => {
		if (moneyType !== 'withdraw' && moneyType !== 'interest') selectedParentId = '';
	});

	$effect(() => {
		if (!form) return;
		if (form._action === 'updateClient') {
			if (form.serverError) toast.error(form.serverError as string);
			if (form.success) toast.success('Az ügyfél sikeresen mentve!');
		}
		if (form._action === 'createMoney') {
			if (form.moneyServerError) toast.error(form.moneyServerError as string);
			if (form.success) toast.success('A pénzügyi tétel sikeresen hozzáadva!');
		}
		if (form._action === 'deleteMoney') {
			if (form.serverError) toast.error(form.serverError as string);
			if (form.success) {
				deleteTarget = null;
				toast.success('Tétel törölve.');
			}
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
				if (result.type === 'success') {
					moneyType = 'deposit';
					selectedParentId = '';
				}
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

	const interestValue = $derived.by(() => {
		if (moneyType !== 'interest' || !selectedParentId) return '';
		const dep = depositsById.get(selectedParentId) as { value: number } | undefined;
		if (!dep) return '';
		return (Math.round(((dep.value * 0.09) / 12) * 100) / 100).toFixed(2);
	});

	const totalDeposits = $derived(
		(data.moneyEntries as Array<{ type: string; value: number }>)
			.filter((e) => e.type === 'deposit')
			.reduce((sum, e) => sum + (e.value ?? 0), 0)
	);
	const totalInterest = $derived(
		(data.moneyEntries as Array<{ type: string; value: number }>)
			.filter((e) => e.type === 'interest')
			.reduce((sum, e) => sum + (e.value ?? 0), 0)
	);
	const totalWithdrawals = $derived(
		(data.moneyEntries as Array<{ type: string; value: number }>)
			.filter((e) => e.type === 'withdraw')
			.reduce((sum, e) => sum + (e.value ?? 0), 0)
	);
	const netBalance = $derived(totalDeposits + totalInterest - totalWithdrawals);

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

<div class="mb-6 flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-bold">{data.client.name_first} {data.client.name_last}</h1>
		{#if data.client.system_id != null}
			<p class="text-sm text-muted-foreground">ID #{data.client.system_id}</p>
		{/if}
	</div>
</div>

<Tabs.Root value="money">
	<Tabs.List>
		<Tabs.Trigger value="money">Számla</Tabs.Trigger>
		<Tabs.Trigger value="personal">Személyes adatok</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="money">
		<!-- ── Money entry form ── -->
		<form method="POST" action="?/createMoney" use:enhance={handleMoneySubmit()} class="mt-8">
			<Card.Root>
				<Card.Header>
					<Card.Title>Pénzügyi tétel hozzáadása</Card.Title>
				</Card.Header>
				<Card.Content class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<!-- Type -->
					<div class="flex flex-col gap-1.5">
						<Label for="money_type">Típus <span class="text-destructive">*</span></Label>
						<select id="money_type" name="type" bind:value={moneyType} class={selectClass}>
							<option value="deposit">Befizetés</option>
							<option value="withdraw">Kivét</option>
							<option value="interest">Kamat</option>
						</select>
						{#if moneyErrors.type}<p class="text-xs text-destructive">{moneyErrors.type}</p>{/if}
					</div>

					<!-- Value -->
					<div class="flex flex-col gap-1.5">
						<Label for="money_value">Összeg <span class="text-destructive">*</span></Label>
						<Input
							id="money_value"
							name="value"
							type="number"
							step="0.01"
							placeholder="0.00"
							value={interestValue || moneyValues.value || ''}
							readonly={!!interestValue}
							aria-invalid={!!moneyErrors.value}
						/>
						{#if moneyErrors.value}<p class="text-xs text-destructive">{moneyErrors.value}</p>{/if}
					</div>

					<!-- End of Term -->
					<div class="flex flex-col gap-1.5">
						<Label for="money_startofterm">Futamidő kezdete</Label>
						<Input
							id="money_startofterm"
							name="startofterm"
							type="date"
							value={moneyValues.startofterm ?? ''}
						/>
					</div>

					<div class="flex flex-col gap-1.5">
						<Label for="money_endofterm">Futamidő vége</Label>
						<Input
							id="money_endofterm"
							name="endofterm"
							type="date"
							value={moneyValues.endofterm ?? ''}
						/>
					</div>

					<!-- Parent deposit (withdraw / interest) -->
					{#if moneyType === 'withdraw' || moneyType === 'interest'}
						<div class="flex flex-col gap-1.5">
							<Label for="money_parent"
								>{moneyType === 'interest' ? 'Kapcsolódó befizetés' : 'Levonás forrása'}</Label
							>
							{#if deposits.length === 0}
								<p class="text-sm text-muted-foreground">Nincs elérhető befizetés.</p>
							{:else}
								<select
									id="money_parent"
									name="parent"
									bind:value={selectedParentId}
									class={selectClass}
								>
									<option value="">— válasszon befizetést —</option>
									{#each deposits as d}
										{@const dep = d as {
											id: string;
											value: number;
											startofterm: string;
											endofterm?: string;
										}}
										<option value={dep.id} selected={moneyValues.parent === dep.id}>
											{formatDate(dep.startofterm)} · {formatMoney(dep.value)}{dep.endofterm
												? ` (lejár: ${formatDate(dep.endofterm)})`
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
							Hozzáadás…
						{:else}
							Tétel hozzáadása
						{/if}
					</Button>
				</Card.Footer>
			</Card.Root>
		</form>

		<!-- ── Money entries list ── -->
		<div class="mt-8">
			<h2 class="mb-3 text-lg font-semibold">Pénzügyi tételek</h2>

			<!-- ── Summary ── -->
			<div class="mt-4 mb-8 rounded-md border p-4">
				<h3 class="mb-3 text-sm font-semibold">Összesítő</h3>
				<div class="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
					<div>
						<p class="text-xs text-muted-foreground">Összes befizetés</p>
						<p class="text-lg font-semibold text-green-700">{formatMoney(totalDeposits)}</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Összes kamat</p>
						<p class="text-lg font-semibold text-blue-700">{formatMoney(totalInterest)}</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Összes kivét</p>
						<p class="text-lg font-semibold text-red-700">{formatMoney(totalWithdrawals)}</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Nettó egyenleg</p>
						<p class="text-lg font-semibold {netBalance >= 0 ? 'text-green-700' : 'text-red-700'}">
							{formatMoney(netBalance)}
						</p>
					</div>
				</div>
			</div>

			{#if data.moneyEntries.length === 0}
				<p class="text-sm text-muted-foreground">Még nincsenek pénzügyi tételek.</p>
			{:else}
				<div class="overflow-x-auto rounded-md border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left font-medium">Típus</th>
								<th class="px-4 py-3 text-right font-medium">Összeg</th>
								<th class="px-4 py-3 text-left font-medium">Futamidő vége</th>
								<th class="px-4 py-3 text-left font-medium">Forrás befizetés</th>
								<th class="px-4 py-3 text-left font-medium">Dátum</th>
								<th class="px-4 py-3"></th>
							</tr>
						</thead>
						<tbody>
							{#each data.moneyEntries as entry}
								{@const e = entry as {
									id: string;
									type: string;
									value: number;
									endofterm?: string;
									parentMoneyItem?: string;
									startofterm?: string;
									created: string;
								}}
								{@const parentDeposit = e.parentMoneyItem}
								<tr class="border-b last:border-0">
									<td class="px-4 py-3">
										{#if e.type === 'deposit'}
											<span
												class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
												>Befizetés</span
											>
										{:else if e.type === 'interest'}
											<span
												class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
												>Kamat</span
											>
										{:else}
											<span
												class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
												>Kivét</span
											>
										{/if}
									</td>
									<td class="px-4 py-3 text-right tabular-nums">{formatMoney(e.value)}</td>
									<td class="px-4 py-3">{formatDate(e.endofterm ?? '')}</td>
									<td class="max-w-[160px] truncate px-4 py-3 text-xs text-muted-foreground">
										{e.expand?.parentMoneyItem?.value
											? formatMoney(e.expand.parentMoneyItem.value)
											: ''} / {formatDate(e.expand?.parentMoneyItem?.startofterm ?? '')}
									</td>
									<td class="px-4 py-3 text-muted-foreground">{formatDate(e.startofterm)}</td>
									<td class="px-4 py-3">
										<Button
											type="button"
											variant="ghost"
											size="sm"
											class="text-destructive hover:text-destructive"
											onclick={() => (deleteTarget = { id: e.id, type: e.type, value: e.value })}
											>Törlés</Button
										>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</Tabs.Content>

	<!-- ── Delete confirmation dialog ── -->
	<Dialog.Root
		open={!!deleteTarget}
		onOpenChange={(o) => {
			if (!o) deleteTarget = null;
		}}
	>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Töröljük a tételt?</Dialog.Title>
				<Dialog.Description>
					{#if deleteTarget}
						Véglegesen törölni készül ezt a
						<strong>{deleteTarget.type}</strong> típusú,
						<strong>{formatMoney(deleteTarget.value)}</strong> összegű tételt. Ez nem vonható vissza.
					{/if}
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (deleteTarget = null)}>Mégse</Button>
				<form method="POST" action="?/deleteMoney" use:enhance>
					<input type="hidden" name="id" value={deleteTarget?.id} />
					<Button type="submit" variant="destructive">Törlés</Button>
				</form>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<Tabs.Content value="personal">
		<!-- ── Client form ── -->
		<form method="POST" action="?/updateClient" use:enhance={handleClientSubmit()}>
			<Card.Root>
				<Card.Header>
					<Card.Title>Személyes adatok</Card.Title>
				</Card.Header>
				<Card.Content class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="flex flex-col gap-1.5">
						<Label for="name_first">Keresztnév <span class="text-destructive">*</span></Label>
						<Input
							id="name_first"
							name="name_first"
							placeholder="Mária"
							value={clientValues.name_first ?? ''}
							aria-invalid={!!clientErrors.name_first}
						/>
						{#if clientErrors.name_first}<p class="text-xs text-destructive">
								{clientErrors.name_first}
							</p>{/if}
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="name_last">Vezetéknév <span class="text-destructive">*</span></Label>
						<Input
							id="name_last"
							name="name_last"
							placeholder="Kovács"
							value={clientValues.name_last ?? ''}
							aria-invalid={!!clientErrors.name_last}
						/>
						{#if clientErrors.name_last}<p class="text-xs text-destructive">
								{clientErrors.name_last}
							</p>{/if}
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="email">E-mail</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="jane.doe@example.com"
							value={clientValues.email ?? ''}
							aria-invalid={!!clientErrors.email}
						/>
						{#if clientErrors.email}<p class="text-xs text-destructive">
								{clientErrors.email}
							</p>{/if}
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="phone_number">Telefonszám</Label>
						<Input
							id="phone_number"
							name="phone_number"
							type="tel"
							placeholder="+1 555 000 0000"
							value={clientValues.phone_number ?? ''}
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="system_id">Azonosító</Label>
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
						<Label for="birth_date">Születési dátum</Label>
						<Input
							id="birth_date"
							name="birth_date"
							type="date"
							value={clientValues.birth_date ?? ''}
						/>
					</div>
					<div class="col-span-full flex flex-col gap-1.5">
						<Label for="birth_place">Születési hely</Label>
						<Input
							id="birth_place"
							name="birth_place"
							placeholder="Város, Ország"
							value={clientValues.birth_place ?? ''}
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mt-4">
				<Card.Header><Card.Title>Cím</Card.Title></Card.Header>
				<Card.Content class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="col-span-full flex flex-col gap-1.5">
						<Label for="adress_street">Utca</Label>
						<Input
							id="adress_street"
							name="adress_street"
							placeholder="Kossuth u. 1."
							value={clientValues.adress_street ?? ''}
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="address_zip">Irányítószám</Label>
						<Input
							id="address_zip"
							name="address_zip"
							placeholder="1011"
							value={clientValues.address_zip ?? ''}
						/>
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="address_city">Város</Label>
						<Input
							id="address_city"
							name="address_city"
							placeholder="Budapest"
							value={clientValues.address_city ?? ''}
						/>
					</div>
					<div class="col-span-full flex flex-col gap-1.5">
						<Label for="address_country">Ország</Label>
						<Input
							id="address_country"
							name="address_country"
							placeholder="Magyarország"
							value={clientValues.address_country ?? ''}
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<div class="mt-4 flex items-center justify-end gap-3">
				<Button type="button" variant="outline" onclick={() => goto('/dashboard/clients/list')}
					>Vissza a listához</Button
				>
				<Button type="submit" disabled={isClientLoading}>
					{#if isClientLoading}
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
						Mentés…
					{:else}
						Ügyfél mentése
					{/if}
				</Button>
			</div>
		</form>
	</Tabs.Content>
</Tabs.Root>
