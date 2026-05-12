<script lang="ts" module>
	import ChartPieIcon from '@lucide/svelte/icons/chart-pie';

	import FrameIcon from '@lucide/svelte/icons/frame';

	import MapIcon from '@lucide/svelte/icons/map';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import ClientsIcon from '@lucide/svelte/icons/users';
	import DashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import PortfoliosIcon from '@lucide/svelte/icons/chart-bar';

	// This is sample data.
	const data = {
		user: {
			name: 'shadcn',
			email: 'm@example.com',
			avatar: '/avatars/shadcn.jpg'
		},
		navMain: [
			{
				title: 'Dashboard',
				url: '/dashboard',
				icon: DashboardIcon
			},
			{
				title: 'Clients',
				url: '#',
				icon: ClientsIcon,
				isActive: true,
				items: [
					{
						title: 'New Client',
						url: '/dashboard/clients/new'
					},
					{
						title: 'Client List',
						url: '/dashboard/clients/list'
					}
				]
			}
			/*	{
				title: 'Portfolios',
				url: '#',
				icon: PortfoliosIcon,
				items: [
					{
						title: 'New portfolio',
						url: '#'
					},
					{
						title: 'Portfolio List',
						url: '/dashboard/portfolios'
					},
					{
						title: 'Quantum',
						url: '#'
					}
				]
			} */
		]
	};
</script>

<script lang="ts">
	import NavMain from './nav-main.svelte';

	import NavUser from './nav-user.svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header>
		<img src="/sania-logo.png" alt="Sania power" class="w-full rounded-sm" />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
