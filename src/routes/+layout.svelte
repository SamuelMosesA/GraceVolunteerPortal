<script lang="ts">
	import {
		setAuthState,
		subscribeToAuthUpdates,
	} from '$lib/firebase/auth.svelte';
	import type { AuthState } from '$lib/types';
	import { onMount } from 'svelte';
	import '../app.css';
	import { goto } from '$app/navigation';

	let authState = $state<AuthState>({ user: null });
	setAuthState(authState)

	onMount(() => {
		subscribeToAuthUpdates(authState);
	});

	$effect(() => {
		if (authState.user===null) {
			goto('/');
		}
	});

	let { children } = $props();
</script>

{@render children()}
