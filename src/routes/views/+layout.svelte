<script lang="ts">
	// Import the navbar component
	import ResponsiveNavbar from '$lib/components/responsive_navbar.svelte';
	import { getAuthState, setLoggedInUser } from '$lib/firebase/auth.svelte.js';

	let { data, children } = $props();

	let authState = getAuthState()

	if(authState.user){
		setLoggedInUser(authState.user)
	}

</script>

{#if authState.user}
	<ResponsiveNavbar />

	<main class="bg-background flex-grow">
		<div class="w-full max-w-500 p-16 md:mx-auto">
			{@render children()}
		</div>
	</main>
{:else}
	<main class="bg-background flex-grow"></main>
{/if}
