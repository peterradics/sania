<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { FieldGroup, Field, FieldLabel } from '$lib/components/ui/field/index.js';

	const id = $props.id();

	let { form }: { form?: { error?: string } | null } = $props();
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Bejelentkezés</Card.Title>
		<Card.Description>Adja meg e-mail címét a bejelentkezéshez</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance>
			<FieldGroup>
				{#if form?.error}
					<p class="text-sm text-destructive">{form.error}</p>
				{/if}
				<Field>
					<FieldLabel for="email-{id}">E-mail</FieldLabel>
					<Input id="email-{id}" name="email" type="email" placeholder="m@example.com" required />
				</Field>
				<Field>
					<div class="flex items-center">
						<FieldLabel for="password-{id}">Jelszó</FieldLabel>
					</div>
					<Input id="password-{id}" name="password" type="password" required />
				</Field>
				<Field>
					<Button type="submit" class="w-full">Bejelentkezés</Button>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
