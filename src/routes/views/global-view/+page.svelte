<script lang="ts">
	import { onMount } from 'svelte';
	import { getGlobalSchedule } from '$lib/firebase/schedule.svelte';
	import type { GlobalScheduleCard } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Search, Calendar, Users, Filter, Clock } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let cards = $state<GlobalScheduleCard[]>([]);
	let isLoading = $state(true);
	let searchQuery = $state('');
	let showAllSchedules = $state(false);

	onMount(async () => {
		cards = await getGlobalSchedule();
		isLoading = false;
	});

	// Dynamic derived state to filter and search through cards
	let filteredCards = $derived(
		cards.filter((card) => {
			// Date filter (Upcoming vs All)
			if (!showAllSchedules) {
				const cardDate = new Date(card.date);
				cardDate.setHours(0, 0, 0, 0);
				const now = new Date();
				now.setHours(0, 0, 0, 0);
				if (cardDate < now) return false;
			}

			// Search query filter
			if (!searchQuery) return true;
			const query = searchQuery.toLowerCase();

			// Match date
			if (card.formattedDate.toLowerCase().includes(query)) return true;

			// Match team, role, or members within any row of this card
			return card.rows.some(
				(row) =>
					row.team.toLowerCase().includes(query) ||
					row.role.toLowerCase().includes(query) ||
					row.members.some((member) => member.toLowerCase().includes(query))
			);
		})
	);
</script>

<div class="mx-auto max-w-4xl px-4 md:p-4">
	<!-- Page Header -->
	<div class="mb-8 flex flex-col gap-6">
		<div class="flex flex-col gap-2">
			<h1 class="text-primary text-4xl font-extrabold tracking-tight">Global Schedule</h1>
			<p class="text-muted-foreground text-base">
				Complete overview of all team assignments, roles, and scheduled volunteers.
			</p>
		</div>

		<!-- Filters & Search Controls -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<!-- Search Bar -->
			<div class="relative flex-1">
				<Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input
					type="text"
					placeholder="Search by date, team, role, or volunteer..."
					class="pl-10"
					bind:value={searchQuery}
				/>
			</div>

			<!-- Toggle filters -->
			<div class="flex items-center gap-2">
				<Button
					variant={showAllSchedules ? 'outline' : 'default'}
					size="sm"
					class="rounded-full px-4"
					onclick={() => (showAllSchedules = false)}
				>
					<Clock class="mr-2 h-4 w-4" />
					Upcoming
				</Button>
				<Button
					variant={showAllSchedules ? 'default' : 'outline'}
					size="sm"
					class="rounded-full px-4"
					onclick={() => (showAllSchedules = true)}
				>
					<Calendar class="mr-2 h-4 w-4" />
					All Schedules
				</Button>
			</div>
		</div>
	</div>

	<!-- Main List -->
	{#if isLoading}
		<div class="space-y-6">
			{#each Array(3) as _, i (i)}
				<Card.Root class="border-border/60 animate-pulse">
					<Card.Content class="p-6">
						<div class="bg-muted mb-4 h-6 w-1/3 rounded"></div>
						<Separator class="my-4" />
						<div class="space-y-3">
							<div class="bg-muted h-4 w-2/3 rounded"></div>
							<div class="bg-muted h-4 w-1/2 rounded"></div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else if filteredCards.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<Filter class="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
			<h3 class="text-xl font-bold">No schedules found</h3>
			<p class="text-muted-foreground mt-2 max-w-sm">
				We couldn't find any schedule matching your criteria. Try adjusting your search query or
				filters.
			</p>
		</div>
	{:else}
		<div class="space-y-8">
			{#each filteredCards as card}
				<Card.Root
					class="border-border/60 hover:border-primary/20 bg-card/40 hover:bg-card shadow-sm transition-all duration-300 hover:shadow-md"
				>
					<!-- Card Header: Large formatted Date -->
					<Card.Header class="bg-muted/10 border-border/40 border-b px-6 py-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="bg-primary/10 text-primary rounded-xl p-2.5">
									<Calendar class="h-5 w-5" />
								</div>
								<h2 class="text-foreground text-2xl font-extrabold tracking-tight">
									{card.formattedDate}
								</h2>
							</div>
							<span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
								{card.date}
							</span>
						</div>
					</Card.Header>

					<!-- Card Content: Rows of assignments -->
					<Card.Content class="p-6">
						<div class="divide-border/40 divide-y">
							{#each card.rows as row}
								<div class="py-4 first:pt-0 last:pb-0">
									<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
										<!-- Team & Role -->
										<div class="flex items-center gap-1.5">
											<span class="text-primary text-base font-bold tracking-tight">
												{row.team}
											</span>
											<span class="text-muted-foreground font-semibold opacity-60">:</span>
											<span class="text-foreground text-sm font-semibold">
												{row.role}
											</span>
										</div>

										<!-- Volunteers -->
										<div class="flex flex-wrap gap-2">
											{#each row.members as member}
												<div
													class="bg-secondary/40 text-secondary-foreground hover:bg-secondary/60 flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold shadow-sm transition-all duration-200"
												>
													<Users class="h-3 w-3 opacity-60" />
													<span>{member}</span>
												</div>
											{:else}
												<span class="text-muted-foreground text-xs italic opacity-60">
													No volunteers assigned
												</span>
											{/each}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
