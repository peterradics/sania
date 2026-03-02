<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isLoading = $state(false);

	$effect(() => {
		if (form?.serverError) {
			toast.error(form.serverError);
		}
		if (form?.success) {
			toast.success('Client saved successfully!');
		}
	});

	function handleSubmit() {
		return () => {
			isLoading = true;
			return async ({ update }: { update: (opts?: { reset: boolean }) => Promise<void> }) => {
				isLoading = false;
				await update({ reset: false });
			};
		};
	}

	type FormValues = Record<string, string | undefined>;
	// Use form values if available (e.g. after validation failure), otherwise fall back to loaded data
	const values = $derived.by(() => {
		if (form?.values) return form.values as FormValues;
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
		} as FormValues;
	});
	const errors = $derived((form?.errors ?? {}) as Record<string, string | undefined>);
</script>

<div class="mx-auto max-w-3xl py-6">
	<div class="mb-6">
		<h1 class="text-2xl font-bold">Edit Client</h1>
		<p class="text-muted-foreground text-sm">Update the client's details below.</p>
	</div>

	<form method="POST" use:enhance={handleSubmit()}>
		<Card.Root>
			<Card.Header>
				<Card.Title>Personal Information</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<!-- First Name -->
				<div class="flex flex-col gap-1.5">
					<Label for="name_first">First Name <span class="text-destructive">*</span></Label>
					<Input
						id="name_first"
						name="name_first"
						placeholder="Jane"
						value={values.name_first ?? ''}
						aria-invalid={!!errors.name_first}
					/>
					{#if errors.name_first}
						<p class="text-destructive text-xs">{errors.name_first}</p>
					{/if}
				</div>

				<!-- Last Name -->
				<div class="flex flex-col gap-1.5">
					<Label for="name_last">Last Name <span class="text-destructive">*</span></Label>
					<Input
						id="name_last"
						name="name_last"
						placeholder="Doe"
						value={values.name_last ?? ''}
						aria-invalid={!!errors.name_last}
					/>
					{#if errors.name_last}
						<p class="text-destructive text-xs">{errors.name_last}</p>
					{/if}
				</div>

				<!-- Email -->
				<div class="flex flex-col gap-1.5">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="jane.doe@example.com"
						value={values.email ?? ''}
						aria-invalid={!!errors.email}
					/>
					{#if errors.email}
						<p class="text-destructive text-xs">{errors.email}</p>
					{/if}
				</div>

				<!-- Phone -->
				<div class="flex flex-col gap-1.5">
					<Label for="phone_number">Phone Number</Label>
					<Input
						id="phone_number"
						name="phone_number"
						type="tel"
						placeholder="+1 555 000 0000"
						value={values.phone_number ?? ''}
					/>
				</div>

				<!-- System ID -->
				<div class="flex flex-col gap-1.5">
					<Label for="system_id">System ID</Label>
					<Input
						id="system_id"
						name="system_id"
						type="number"
						placeholder="12345"
						value={values.system_id ?? ''}
						aria-invalid={!!errors.system_id}
					/>
					{#if errors.system_id}
						<p class="text-destructive text-xs">{errors.system_id}</p>
					{/if}
				</div>

				<!-- Birth Date -->
				<div class="flex flex-col gap-1.5">
					<Label for="birth_date">Birth Date</Label>
					<Input
						id="birth_date"
						name="birth_date"
						type="date"
						value={values.birth_date ?? ''}
					/>
				</div>

				<!-- Birth Place -->
				<div class="col-span-full flex flex-col gap-1.5">
					<Label for="birth_place">Birth Place</Label>
					<Input
						id="birth_place"
						name="birth_place"
						placeholder="City, Country"
						value={values.birth_place ?? ''}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="mt-4">
			<Card.Header>
				<Card.Title>Address</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<!-- Street -->
				<div class="col-span-full flex flex-col gap-1.5">
					<Label for="adress_street">Street</Label>
					<Input
						id="adress_street"
						name="adress_street"
						placeholder="123 Main St"
						value={values.adress_street ?? ''}
					/>
				</div>

				<!-- ZIP -->
				<div class="flex flex-col gap-1.5">
					<Label for="address_zip">ZIP / Postal Code</Label>
					<Input
						id="address_zip"
						name="address_zip"
						placeholder="10001"
						value={values.address_zip ?? ''}
					/>
				</div>

				<!-- City -->
				<div class="flex flex-col gap-1.5">
					<Label for="address_city">City</Label>
					<Input
						id="address_city"
						name="address_city"
						placeholder="New York"
						value={values.address_city ?? ''}
					/>
				</div>

				<!-- Country -->
				<div class="col-span-full flex flex-col gap-1.5">
					<Label for="address_country">Country</Label>
					<Input
						id="address_country"
						name="address_country"
						placeholder="United States"
						value={values.address_country ?? ''}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="mt-6 flex items-center justify-end gap-3">
			<Button type="button" variant="outline" onclick={() => goto('/dashboard/clients/list')}>
				Back to List
			</Button>
			<Button type="submit" disabled={isLoading}>
				{#if isLoading}
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
</div>
