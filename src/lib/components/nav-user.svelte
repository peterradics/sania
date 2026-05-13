<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	let { user }: { user: { name: string; email: string; avatar: string } } = $props();
	const sidebar = useSidebar();

	let quitDialogOpen = $state(false);
</script>

<Sidebar.Menu>
	<Sidebar.MenuButton onclick={() => (quitDialogOpen = true)}>
		<LogOutIcon />
		Logout
	</Sidebar.MenuButton>
</Sidebar.Menu>

<Dialog.Root bind:open={quitDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure?</Dialog.Title>
			<Dialog.Description>Would you like to logout?</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (quitDialogOpen = false)}>Cancel</Button>
			<Button variant="destructive" onclick={() => goto('/logout')}>Logout</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
