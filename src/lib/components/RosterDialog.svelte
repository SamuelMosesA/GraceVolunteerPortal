<script lang="ts">
	import type { Roster } from '$lib/types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { X } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';

	let { isOpen = $bindable(false), roster = null }: { isOpen: boolean; roster: Roster | null } =
		$props();

	function close() {
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		transition:fade={{ duration: 200 }}
		class="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm"
		onclick={close}
	></div>

	<!-- Dialog Content -->
	<div
		transition:scale={{ duration: 200, start: 0.95 }}
		class="bg-background border-border fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-2xl"
	>
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-2xl font-bold tracking-tight">All on Schedule</h2>
			<Button variant="ghost" size="icon" onclick={close} class="rounded-full">
				<X class="h-5 w-5" />
			</Button>
		</div>

		{#if roster && Object.keys(roster).length > 0}
			<div class="max-h-[60vh] overflow-y-auto pr-2">
				<div class="space-y-6">
					{#each Object.entries(roster) as [role, volunteers]}
						<div>
							<h3 class="text-primary mb-2 text-sm font-bold tracking-widest uppercase opacity-70">
								{role}
							</h3>
							<div class="bg-muted/30 space-y-1 rounded-xl p-3">
								{#each volunteers as name}
									<p class="text-foreground font-medium">{name}</p>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<p class="text-muted-foreground py-8 text-center">No roster information available.</p>
		{/if}

		<div class="mt-6 flex justify-end">
			<Button onclick={close} class="w-full sm:w-auto">Close</Button>
		</div>
	</div>
{/if}
