<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
    import * as  Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { getLoggedInUser } from '$lib/firebase/auth.svelte';
    import { Button } from "$lib/components/ui/button/index.js";

	let user = getLoggedInUser();

</script>

<div class="max-w-lg md:min-w-lg justify-self-center">
<h1 class="text-primary my-4 text-3xl">Welcome</h1>
<p class="text-foreground text-5xl">{user.displayName}</p>

<Separator class="bg-border my-8" />

<h1 class="text-primary my-4 text-3xl">Next Scheduled</h1>
<Card.Root>
    <Card.Header>
      <Card.Title><span class="font-bold text-2xl">Date</span></Card.Title>
       <Card.Action>
      <Button variant="default">Acknowledge</Button>
    </Card.Action>
    </Card.Header> 
    <Card.Content>
      <p class="font-bold">Role</p>
    </Card.Content>
  </Card.Root>

<Separator class="bg-border my-8" />

<h1 class="text-primary text-2xl my-4">Roster</h1>
<div class="border rounded-lg overflow-clip">
<Table.Root class="p-0.5">
	<Table.Header class="bg-muted">
		<Table.Row>
			<Table.Head class="w-1/3">Date</Table.Head>
			<Table.Head>Role</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		<Table.Row>
			<Table.Cell class="font-medium">INV001</Table.Cell>
			<Table.Cell>Paid</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>
</div>
</div>