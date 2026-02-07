<script lang="ts">
	import { goto } from '$app/navigation';
	import FirebaseUI from '$lib/components/firebase_ui.svelte';
	import { getAuthState} from '$lib/firebase/auth.svelte';

	$effect(() => {
		if (getAuthState().user) goto('/views/home');
	});

</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<FirebaseUI />
</div>
