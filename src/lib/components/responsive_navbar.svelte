<!--
  src/lib/components/ResponsiveNavbar.svelte
  A responsive navigation bar component for Svelte, styled with Tailwind CSS.
-->
<script lang="ts">
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import { firebaseAuth } from '$lib/firebase/auth.svelte';
	import type { NavBarLinks } from '$lib/types';
	import { signOut } from 'firebase/auth';
	// A reactive variable to control the visibility of the mobile menu.
	// When 'isOpen' is true, the mobile menu will be displayed.
	let isOpen = $state(false);

	// Toggles the state of the mobile menu.
	function toggleMenu() {
		isOpen = !isOpen;
	}

	async function logout() {
		signOut(firebaseAuth);
	}

	const navBarLinks: NavBarLinks[] = [
		{ url: '/views/home', displayLabel: 'Home' },
		{ url: '/views/instructions', displayLabel: 'Instructions' }
	];
</script>

<!-- The 'nav' element is the main container for the navbar. -->
<nav class="bg-card text-foreground m-4 rounded-lg border p-4 shadow-md">
	<div class="mx-8 flex items-center justify-between">
		<!-- Brand/Logo -->
		<a href="/views/home" class="text-primary text-2xl font-bold">{PUBLIC_APP_NAME}</a>

		<!-- Hamburger Menu Button (visible on mobile) -->
		<button
			onclick={toggleMenu}
			class="focus:outline-none md:hidden"
			aria-label="Toggle navigation"
			aria-expanded={isOpen}
		>
			<!-- Hamburger icon bars that animate into an 'X' -->
			<div
				class="bg-foreground mb-1.5 h-0.5 w-6 rounded-lg transition-transform duration-300 ease-in-out"
				class:rotate-45={isOpen}
				class:translate-y-2={isOpen}
				class:bg-red-400={isOpen}
			></div>
			<div
				class="bg-foreground h-0.5 w-6 rounded-lg transition-opacity duration-300 ease-in-out"
				class:opacity-0={isOpen}
			></div>
			<div
				class="bg-foreground mt-1.5 h-0.5 w-6 rounded-lg transition-transform duration-300 ease-in-out"
				class:-rotate-45={isOpen}
				class:-translate-y-2={isOpen}
				class:bg-red-400={isOpen}
			></div>
		</button>

		<!-- Desktop Navigation Links -->
		<ul class="hidden items-center space-x-6 md:flex">
			{#each navBarLinks as link}
				<li>
					<a href={link.url} class="hover:text-primary font-bold transition-colors duration-200"
						>{link.displayLabel}</a
					>
				</li>
			{/each}
			<li>
				<button
					onclick={logout}
					class="hover:text-primary font-bold transition-colors duration-200"
				>
					Logout
				</button>
			</li>
		</ul>
	</div>

	<!-- Mobile Navigation Menu (Dropdown) -->
	<div
		class="overflow-hidden transition-all duration-300 ease-in-out md:hidden"
		class:max-h-0={!isOpen}
		class:max-h-screen={isOpen}
	>
		<ul class="flex w-full flex-col items-stretch space-y-4 py-4 pr-4">
			{#each navBarLinks as link}
				<li>
					<a
						href={link.url}
						onclick={toggleMenu}
						class="block w-full text-right font-bold hover:text-gray-300">{link.displayLabel}</a
					>
				</li>
			{/each}
			<li>
				<button onclick={logout} class="block w-full text-right font-bold hover:text-gray-300">
					Logout
				</button>
			</li>
		</ul>
	</div>
</nav>
