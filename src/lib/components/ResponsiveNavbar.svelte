<!-- 
  src/lib/components/ResponsiveNavbar.svelte
  A responsive navigation bar component for Svelte, styled with Tailwind CSS.
-->
<script lang="ts">
    import { PUBLIC_APP_NAME } from "$env/static/public"
	import { firebaseAuth} from "$lib/firebase/auth.svelte";
	import type { NavBarLinks } from "$lib/types";
	import { signOut } from "firebase/auth";
    // A reactive variable to control the visibility of the mobile menu.
    // When 'isOpen' is true, the mobile menu will be displayed.
    let isOpen = $state(false);
  
    // Toggles the state of the mobile menu.
    function toggleMenu() {
      isOpen = !isOpen;
    }

    async function logout(){
      signOut(firebaseAuth)
    }

    const navBarLinks: NavBarLinks[] = [
      {url:"/views/home", displayLabel:"Home"},
      {url:"/views/availability", displayLabel:"Availability"},
      {url:"/views/fullroster", displayLabel:"Full-Roster"},
      {url:"/views/admintools", displayLabel:"Admin-Tools"},
    ]
  </script>
  
  <!-- The 'nav' element is the main container for the navbar. -->
  <nav class="bg-card  text-foreground p-4 shadow-md m-4 border rounded-lg">
    <div class="mx-8  flex justify-between items-center">
      
      <!-- Brand/Logo -->
      <a href="/views/home" class="text-2xl font-bold text-primary">{PUBLIC_APP_NAME}</a>
  
      <!-- Hamburger Menu Button (visible on mobile) -->
      <button onclick={toggleMenu} class="md:hidden focus:outline-none" aria-label="Toggle navigation" aria-expanded={isOpen}>
        <!-- Hamburger icon bars that animate into an 'X' -->
        <div class="w-6 h-0.5 bg-foreground rounded-lg mb-1.5 transition-transform duration-300 ease-in-out" class:rotate-45={isOpen} class:translate-y-2={isOpen} class:bg-red-400={isOpen}></div>
        <div class="w-6 h-0.5 bg-foreground rounded-lg transition-opacity duration-300 ease-in-out" class:opacity-0={isOpen}></div>
        <div class="w-6 h-0.5 bg-foreground rounded-lg mt-1.5 transition-transform duration-300 ease-in-out" class:-rotate-45={isOpen} class:-translate-y-2={isOpen} class:bg-red-400={isOpen}></div>
      </button>
  
      <!-- Desktop Navigation Links -->
      <ul class="hidden md:flex space-x-6 items-center">
        {#each navBarLinks as link }
          <li><a href={link.url} class="hover:text-primary transition-colors duration-200">{link.displayLabel}</a></li>
        {/each}
          <li><a href="#" onclick={logout} class="hover:text-primary transition-colors duration-200">Logout</a></li>
      </ul>
  
    </div>
  
    <!-- Mobile Navigation Menu (Dropdown) -->
    <div class="md:hidden overflow-hidden transition-all duration-300 ease-in-out" class:max-h-0={!isOpen} class:max-h-screen={isOpen}>
      <ul class="flex flex-col items-center space-y-4 py-4">
          {#each navBarLinks as link }
            <li><a href={link.url} onclick={toggleMenu} class="block hover:text-gray-300">{link.displayLabel}</a></li>
          {/each}
          <li><a href="#" onclick={logout} class="block hover:text-gray-300">Logout</a></li>
      </ul>
    </div>
  </nav>
