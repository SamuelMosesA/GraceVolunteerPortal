<script lang="ts">
	import { goto } from '$app/navigation';
	import LoginForm from '$lib/components/login-form.svelte';
	import { getAuthState} from '$lib/firebase/auth.svelte';

	$effect(() => {
		if (getAuthState().user) goto('/views/home');
	});

</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<LoginForm />
</div>
