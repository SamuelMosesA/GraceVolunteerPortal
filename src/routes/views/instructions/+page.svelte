<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllInstructions } from '$lib/firebase/instructions.svelte';
	import type { RoleInstruction } from '$lib/types';
	import { marked } from 'marked';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Accordion from '$lib/components/ui/accordion';

	let instructions = $state<RoleInstruction[]>([]);
	let isLoading = $state(true);

	onMount(async () => {
		instructions = await getAllInstructions();
		isLoading = false;
	});

	// Sort instructions by Team then Role
	let sortedInstructions = $derived(
		[...instructions].sort((a, b) => {
			if (a.team === b.team) {
				return a.role.localeCompare(b.role);
			}
			return a.team.localeCompare(b.team);
		})
	);
</script>

<div class="mx-auto max-w-4xl p-4">
	<h1 class="text-primary my-6 text-3xl font-bold">Role Instructions</h1>

	{#if isLoading}
		<p>Loading instructions...</p>
	{:else if instructions.length === 0}
		<p class="text-muted-foreground">No instructions found.</p>
	{:else}
		<Accordion.Root type="single" class="w-full space-y-4">
			{#each sortedInstructions as instruction}
				<Card.Root>
					<Accordion.Item value="{instruction.team}-{instruction.role}" class="border-b-0">
						<Accordion.Trigger class="px-6 py-4 hover:no-underline">
							<span class="text-lg font-semibold text-yellow-500"
								>{instruction.team}
								<span class="text-muted-foreground font-normal">({instruction.role})</span></span
							>
						</Accordion.Trigger>
						<Accordion.Content class="px-6 pb-4">
							<div class="prose dark:prose-invert max-w-none">
								{@html marked(instruction.instructions_md || '')}
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</Card.Root>
			{/each}
		</Accordion.Root>
	{/if}
</div>
