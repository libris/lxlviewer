<script>
	let { condition, withElement, children } = $props();
</script>

{#if condition}
	<svelte:element this={withElement}>
		{@render children()}
	</svelte:element>
{:else}
	{@render children()}
{/if}
