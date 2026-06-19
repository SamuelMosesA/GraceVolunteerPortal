<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ArrowLeft, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import ResponsiveNavbar from '$lib/components/responsive_navbar.svelte';

	let { data }: { data: PageData } = $props();
	const instruction = data.instruction;
	let zoomedImageSrc = $state<string | null>(null);

	// Configure marked to resolve relative image paths to /instructions/ and wrap in zoomable container
	marked.use({
		renderer: {
			image({ href, title, text }) {
				let src = href;
				if (src && !src.startsWith('/') && !src.startsWith('http')) {
					src = `/instructions/${src}`;
				}
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

<ResponsiveNavbar />

<main class="w-full p-4 md:p-8">
	<div class="w-full">
		<div class="mb-6 flex items-center justify-between">
			<Button variant="ghost" onclick={() => window.close()} class="gap-2">
				<ArrowLeft size={16} />
				Close Tab
			</Button>
		</div>

		<Card.Root class="w-full overflow-hidden rounded-lg border">
			<Card.Header class="bg-muted/30 border-b px-6 py-4">
				<h1 class="text-primary text-3xl font-bold tracking-tight">
					{instruction.team}
					{#if instruction.role !== instruction.team}
						<span class="text-muted-foreground font-normal">({instruction.role})</span>
					{/if}
				</h1>
			</Card.Header>
			<Card.Content class="px-6 py-8">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="prose dark:prose-invert max-w-none w-full" onclick={handleInstructionClick}>
					{@html marked(instruction.instructions_md || '')}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</main>
