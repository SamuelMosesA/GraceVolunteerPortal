<script lang="ts">
	import { onMount } from 'svelte';
	import { firebaseAuth } from '$lib/firebase/auth.svelte';
	import { GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
	import 'firebaseui/dist/firebaseui.css';

	let uiContainer: HTMLElement;

	onMount(() => {
		import('firebaseui').then((firebaseui) => {
			const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebaseAuth);

			ui.start(uiContainer, {
				signInOptions: [GoogleAuthProvider.PROVIDER_ID, EmailAuthProvider.PROVIDER_ID],
				signInSuccessUrl: '/views/home',
				signInFlow: 'popup',
				callbacks: {
					signInSuccessWithAuthResult: function (authResult, redirectUrl) {
						// User successfully signed in.
						// Return type determines whether we continue the redirect automatically
						// or whether we leave that to developer to handle.
						return true;
					},
					uiShown: function () {
						// The widget is rendered.
					}
				}
			});
		});

		return () => {
			// ui.reset() // Optional: reset UI on unmount
		};
	});
</script>

<div class="flex w-full max-w-sm flex-col items-center gap-6">
	<img class="w-1/2" src="/gracechurchlogo.png" alt="Grace Church Logo" />

	<div class="text-center text-4xl font-bold">Grace Volunteer Portal</div>

	<div bind:this={uiContainer} class="firebase-ui-container w-full"></div>
</div>

<style>
	:global(.firebaseui-container) {
		box-shadow: none !important;
		background-color: transparent !important;
	}

	/* Use theme variables for main UI text (labels, titles, etc) */
	:global(.firebaseui-label),
	:global(.firebaseui-input),
	:global(.firebaseui-title),
	:global(.firebaseui-text),
	:global(.firebaseui-error) {
		color: var(--foreground) !important;
		opacity: 0.9;
	}

	/* Provider buttons will now use their native FirebaseUI colors for better contrast */

	/* Adjusting the card to match the app's card style */
	:global(.firebaseui-card) {
		background-color: var(--card) !important;
		border: 1px solid var(--border) !important;
		border-radius: var(--radius) !important;
		box-shadow: none !important;
	}

	/* Ensure provider buttons look good */
	:global(.firebaseui-idp-button) {
		border-radius: var(--radius) !important;
		box-shadow: none !important;
		border: 1px solid var(--border) !important;
	}

	/* Specific fix for input borders and focus */
	:global(.mdl-textfield__input) {
		border-bottom: 1px solid var(--border) !important;
	}
	:global(.mdl-textfield--focused .mdl-textfield__input) {
		border-bottom: 2px solid var(--primary) !important;
	}
</style>
