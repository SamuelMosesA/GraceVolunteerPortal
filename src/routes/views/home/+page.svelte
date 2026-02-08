<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { getLoggedInUser } from '$lib/firebase/auth.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getUserSchedule, getNearestShift } from '$lib/firebase/schedule.svelte';
	import type { UserSchedule, Shift } from '$lib/types';
	import { onMount } from 'svelte';

	let user = getLoggedInUser();
	let schedule = $state<UserSchedule | null>(null);
	let nearestShift = $derived(schedule ? getNearestShift(schedule.shifts) : null);
	let isLoading = $state(true);

	onMount(async () => {
		if (user && user.email) {
			schedule = await getUserSchedule(user.email);
		}
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
		<Card.Root>
			<Card.Header>
				<Card.Title><span class="text-2xl font-bold">{nearestShift.date}</span></Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="font-bold">{nearestShift.role} - {nearestShift.team}</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="text-muted-foreground">No upcoming shifts scheduled.</p>
	{/if}

	<Separator class="bg-border my-8" />

	<h1 class="text-primary my-4 text-2xl">Roster</h1>
	<div class="overflow-clip rounded-lg border">
		<Table.Root class="p-0.5">
			<Table.Header class="bg-muted">
				<Table.Row>
					<Table.Head class="w-1/3">Date</Table.Head>
					<Table.Head>Team</Table.Head>
					<Table.Head>Role</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each schedule?.shifts.filter((s) => {
					const shiftDate = new Date(s.date);
					shiftDate.setHours(0, 0, 0, 0);
					const now = new Date();
					now.setHours(0, 0, 0, 0);
					return shiftDate >= now;
				}) || [] as shift}
					<Table.Row>
						<Table.Cell class="font-medium">{shift.date}</Table.Cell>
						<Table.Cell>{shift.team}</Table.Cell>
						<Table.Cell>{shift.role}</Table.Cell>
					</Table.Row>
				{/each}
				{#if !isLoading && (!schedule || schedule.shifts.filter((s) => {
							const shiftDate = new Date(s.date);
							shiftDate.setHours(0, 0, 0, 0);
							const now = new Date();
							now.setHours(0, 0, 0, 0);
							return shiftDate >= now;
						}).length === 0)}
					<Table.Row>
						<Table.Cell colspan={3} class="text-center">No shifts found.</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
