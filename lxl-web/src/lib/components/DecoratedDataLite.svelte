<script lang="ts">
	import type { DisplayDecoratedLite } from '$lib/types/xl';

	export let data: DisplayDecoratedLite;
</script>

{#if Array.isArray(data)}
	{#each data as arrayItem (arrayItem)}
		{#if Array.isArray(arrayItem)}
			<span class={arrayItem[1]}>{arrayItem[0]}</span>
		{:else}
			{arrayItem}
		{/if}
	{/each}
{/if}

<style lang="postcss">
	@reference "../../app.css";

	.sigel {
		color: var(--color-subtle);
	}
</style>
