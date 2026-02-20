<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllInstructions } from '$lib/firebase/instructions.svelte';
	import type { RoleInstruction } from '$lib/types';
	import { marked } from 'marked';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Input } from '$lib/components/ui/input';
	import { Search, ZoomIn, X } from '@lucide/svelte';

	let instructions = $state<RoleInstruction[]>([]);
	let isLoading = $state(true);
	let searchQuery = $state('');
	let zoomedImageSrc = $state<string | null>(null);

	onMount(async () => {
		instructions = await getAllInstructions();
		isLoading = false;
	});

	// Configure marked to resolve relative image paths to /instructions/ and wrap in zoomable container
	marked.use({
		renderer: {
			image({ href, title, text }) {
				let src = href;
				if (src && !src.startsWith('/') && !src.startsWith('http')) {
					src = `/instructions/${src}`;
				}
				// Return a container that we can handle via event delegation
				return `
					<div 
						class="instruction-image-container group relative cursor-zoom-in max-w-[300px] h-[300px] my-6 mx-auto md:mx-0 overflow-hidden rounded-xl border-2 border-muted bg-muted shadow-sm hover:shadow-lg transition-all duration-300"
						data-zoom-src="${src}"
					>
						<img src="${src}" alt="${text}" ${title ? `title="${title}"` : ''} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
						<div class="absolute inset-0 flex items-center justify-center bg-black/5 opacity-100 transition-opacity duration-300">
							<div class="bg-black/30 p-2 rounded-full backdrop-blur-md transform transition-transform duration-300 group-hover:scale-110 border border-white/10 shadow-lg">
								<img src="/icons/zoom.svg" class="w-6 h-6 opacity-90" alt="Zoom" />
							</div>
						</div>
					</div>`;
			}
		}
	});

	// Filter and Sort instructions by Team then Role
	let filteredAndSortedInstructions = $derived(
		instructions
			.filter((instruction) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					instruction.team.toLowerCase().includes(searchLower) ||
					instruction.role.toLowerCase().includes(searchLower)
				);
			})
			.sort((a, b) => {
				if (a.team === b.team) {
					return a.role.localeCompare(b.role);
				}
				return a.team.localeCompare(b.team);
			})
	);

	// Event delegation for zoom clicks
	function handleInstructionClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const container = target.closest('.instruction-image-container');
		if (container) {
			zoomedImageSrc = container.getAttribute('data-zoom-src');
		}
	}
</script>

<!-- Zoom Overlay -->
{#if zoomedImageSrc}
	<div
		class="animate-in fade-in fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4 drop-shadow-2xl duration-300"
		onclick={() => (zoomedImageSrc = null)}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && (zoomedImageSrc = null)}
	>
		<button class="absolute top-6 right-6 text-white/70 transition-colors hover:text-white">
			<X size={32} />
		</button>
		<div class="relative max-h-full max-w-full overflow-hidden">
			<img
				src={zoomedImageSrc}
				alt="Zoomed instruction"
				class="animate-in zoom-in-95 max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl duration-300"
			/>
		</div>
	</div>
{/if}

<div class="mx-auto max-w-4xl md:p-4">
	<div class="mb-8 flex flex-col gap-6 px-4 md:px-0">
		<h1 class="text-primary text-3xl font-bold">Role Instructions</h1>

		<div class="relative">
			<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
			<Input
				type="text"
				placeholder="Search instructions by team or role..."
				class="pl-10"
				bind:value={searchQuery}
			/>
		</div>
	</div>

	{#if isLoading}
		<p class="px-4">Loading instructions...</p>
	{:else if filteredAndSortedInstructions.length === 0}
		<p class="text-muted-foreground px-4">No instructions found matching your search.</p>
	{:else}
		<Accordion.Root type="single" class="w-full space-y-4">
			{#each filteredAndSortedInstructions as instruction}
				<Card.Root class="md:rounded-lg md:border-x">
					<Accordion.Item value="{instruction.team}-{instruction.role}" class="border-b-0">
						<Accordion.Trigger class="px-4 py-3 hover:no-underline md:px-6 md:py-4">
							<span class="text-lg font-semibold text-yellow-500">
								{instruction.team}
								{#if instruction.role !== instruction.team}
									<span class="text-muted-foreground font-normal">({instruction.role})</span>
								{/if}
							</span>
						</Accordion.Trigger>
						<Accordion.Content class="px-4 pb-3 md:px-6 md:pb-4">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="prose dark:prose-invert max-w-none" onclick={handleInstructionClick}>
								{@html marked(instruction.instructions_md || '')}
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</Card.Root>
			{/each}
		</Accordion.Root>
	{/if}
</div>
