<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { getLoggedInUser } from '$lib/firebase/auth.svelte';
	import {
		getUserSchedule,
		getNearestShift,
		getUpcomingShifts,
		getScheduleTimes
	} from '$lib/firebase/schedule.svelte';
	import type { UserSchedule } from '$lib/types';
	import { onMount } from 'svelte';
	import { formatDate } from '$lib/utils';

	let user = getLoggedInUser();
	let schedule = $state<UserSchedule | null>(null);
	let scheduleTimes = $state<Record<string, string>>({});
	let upcomingShifts = $derived(schedule ? getUpcomingShifts(schedule.shifts) : []);
	let nearestShift = $derived(schedule ? getNearestShift(schedule.shifts) : null);
	let isLoading = $state(true);

	onMount(async () => {
		const [scheduleData, timesData] = await Promise.all([
			user && user.email ? getUserSchedule(user.email) : Promise.resolve(null),
			getScheduleTimes()
		]);
		schedule = scheduleData;
		scheduleTimes = timesData;
		isLoading = false;
	});
</script>

<div class="max-w-lg justify-self-center md:min-w-lg">
	<h1 class="text-primary my-4 text-3xl">Welcome</h1>
	<p class="text-foreground text-5xl">{user ? user.displayName : 'Guest'}</p>

	<Separator class="bg-border my-8" />

	<h1 class="text-primary my-4 text-3xl">Next Scheduled</h1>
	{#if isLoading}
		<p>Loading schedule...</p>
	{:else if nearestShift}
		<Card.Root class="overflow-hidden border-none bg-transparent shadow-none">
			<Card.Content class="p-0">
				<div class="flex items-center gap-6">
					<!-- Left Section: Date and Time in a rounded pill -->
					<div
						class="bg-primary/10 text-primary flex min-w-[220px] flex-col justify-center rounded-3xl px-10 py-8 text-center"
					>
						<span class="text-5xl font-black tracking-tighter uppercase">
							{formatDate(nearestShift.date).split(' ')[0]}
						</span>
						<span class="text-xl font-bold tracking-widest uppercase opacity-80">
							{formatDate(nearestShift.date).split(' ').slice(1, 2).join(' ')}
						</span>
						<span class="mt-4 text-xl font-medium opacity-70">
							{scheduleTimes[nearestShift.team] || '--:--'}
						</span>
					</div>

					<!-- Right Section: Role and Team -->
					<div class="flex flex-col justify-center text-left">
						<p class="text-foreground text-3xl font-extrabold tracking-tight">
							{nearestShift.role}
						</p>
						<p class="text-muted-foreground text-xl font-medium">{nearestShift.team}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="text-muted-foreground">No upcoming shifts scheduled.</p>
	{/if}

	<Separator class="bg-border my-8" />

	<h1 class="text-primary my-4 text-2xl">Full Roster</h1>
	<div class="overflow-clip rounded-lg border">
		<Table.Root class="p-0.5">
			<Table.Header class="bg-muted">
				<Table.Row>
					<Table.Head class="w-1/4">Date</Table.Head>
					<Table.Head class="w-1/4">Time</Table.Head>
					<Table.Head>Team</Table.Head>
					<Table.Head>Role</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each upcomingShifts as shift}
					<Table.Row>
						<Table.Cell class="font-medium">{formatDate(shift.date)}</Table.Cell>
						<Table.Cell>{scheduleTimes[shift.team] || '--:--'}</Table.Cell>
						<Table.Cell>{shift.team}</Table.Cell>
						<Table.Cell>{shift.role}</Table.Cell>
					</Table.Row>
				{/each}
				{#if !isLoading && upcomingShifts.length === 0}
					<Table.Row>
						<Table.Cell colspan={4} class="text-center">No shifts found.</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
