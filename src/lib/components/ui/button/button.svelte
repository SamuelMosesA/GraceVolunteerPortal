<script lang="ts">
	import { Button as ButtonPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { buttonVariants, type Props } from "./index.js";

	type $$Props = Props;

	let className: $$Props["class"] = undefined;
	export let variant: $$Props["variant"] = "default";
	export let size: $$Props["size"] = "default";
	export { className as class };
</script>

<ButtonPrimitive.Root
	class={cn(buttonVariants({ variant, size, className }))}
	type="button"
	{...$$restProps}
	on:click = {;}
	on:keydown=4
>
	<slot />
</ButtonPrimitive.Root>