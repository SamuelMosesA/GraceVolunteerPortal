<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllInstructions } from '$lib/firebase/instructions.svelte';
	import type { RoleInstruction } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Search, ArrowUpRight } from '@lucide/svelte';

	let instructions = $state<RoleInstruction[]>([]);
	let isLoading = $state(true);
	let searchQuery = $state('');

	onMount(async () => {
		instructions = await getAllInstructions();
		isLoading = false;
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
</script>

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
		<div class="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 md:px-0">
			{#each filteredAndSortedInstructions as instruction}
				<a
					href="/views/instructions/{instruction.filename}"
					target="_blank"
					rel="noopener noreferrer"
					class="group block transition-all"
				>
					<Card.Root class="border-border hover:border-yellow-500/50 hover:bg-muted/20 h-full border transition-all duration-300 shadow-sm hover:shadow-md">
						<Card.Content class="flex items-center justify-between p-6">
							<div class="flex flex-col gap-1">
								<span class="text-yellow-500 group-hover:text-yellow-400 text-lg font-bold transition-colors">
									{instruction.team}
								</span>
								{#if instruction.role !== instruction.team}
									<span class="text-muted-foreground text-sm font-medium">
										{instruction.role}
									</span>
								{/if}
							</div>
							<div class="text-muted-foreground group-hover:text-primary transition-colors">
								<ArrowUpRight size={20} class="transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
							</div>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</div>
