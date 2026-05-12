<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ActionData, PageData } from './$types';
	import { passwordGen } from '$lib/utils.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isLoading = $state(false);
	let password = $state('');
	let suggestedSystemId = $state('');

	$effect(() => {
		if (form?.serverError) {
			toast.error(form.serverError);
		}
	});

	function handleSubmit() {
		return ({ cancel }: { cancel: () => void }) => {
			isLoading = true;
			return async ({
				result,
				update
			}: {
				result: { type: string };
				update: () => Promise<void>;
			}) => {
				isLoading = false;
				if (result.type === 'redirect') {
					toast.success('Client created successfully!');
					await update();
				} else {
					await update();
				}
			};
		};
	}

	type FormValues = Record<string, string | undefined>;
	const values = $derived((form?.values ?? {}) as FormValues);
	const errors = $derived((form?.errors ?? {}) as Record<string, string | undefined>);

	onMount(() => {
		password = values.password ?? passwordGen();
		if (!values.system_id) {
			const rand = Math.floor(Math.random() * 9) + 1;
			suggestedSystemId = String(data.maxSystemId + rand);
		}
	});
</script>

<div class="mx-auto max-w-4xl px-4 py-6">
	<div class="mb-6">
		<h1 class="text-2xl font-bold">New Client</h1>
		<p class="text-sm text-muted-foreground">Fill in the details to create a new client.</p>
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
						<p class="text-xs text-destructive">{errors.name_first}</p>
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
						<p class="text-xs text-destructive">{errors.name_last}</p>
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
						<p class="text-xs text-destructive">{errors.email}</p>
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
					<Label for="birth_place">Birth Place</Label>
					<Input
						id="birth_place"
						name="birth_place"
						placeholder="City, Country"
						value={values.birth_place ?? ''}
					/>
				</div>

				<!-- Birth Date -->
				<div class="flex flex-col gap-1.5">
					<Label for="birth_date">Birth Date</Label>
					<Input id="birth_date" name="birth_date" type="date" value={values.birth_date ?? ''} />
				</div>

				<!-- Birth Place -->
				<div class="flex flex-col gap-1.5">
					<Label for="system_id">System ID</Label>
					<Input
						id="system_id"
						name="system_id"
						type="number"
						placeholder="12345"
						value={values.system_id ?? suggestedSystemId}
						aria-invalid={!!errors.system_id}
					/>
					{#if errors.system_id}
						<p class="text-xs text-destructive">{errors.system_id}</p>
					{/if}
				</div>

				<div class="flex flex-col gap-1.5">
					<Label for="password">Password</Label>
					<Input
						id="password"
						name="password"
						type="text"
						placeholder="Password"
						bind:value={password}
						aria-invalid={!!errors.password}
					/>
					<Button variant="outline" type="button" onclick={() => (password = passwordGen())}>
						Generate Password
					</Button>
					{#if errors.password}
						<p class="text-xs text-destructive">{errors.password}</p>
					{/if}
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
			<Button type="button" variant="outline" onclick={() => goto('/dashboard/clients')}>
				Cancel
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
