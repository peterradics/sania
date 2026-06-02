<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<!-- Mobile-only top bar -->
		<header
			class="sticky top-0 z-20 flex h-12 items-center gap-2 border-b bg-background px-4 md:hidden"
		>
			<Sidebar.Trigger />
			<span class="text-sm font-semibold">Sania</span>
		</header>

		<div class="w-full min-w-0 p-4 sm:p-8">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
