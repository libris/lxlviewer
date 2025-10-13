<script lang="ts">
	import type { DisplayDecoratedLite } from '$lib/types/xl';

	interface Props {
		data: DisplayDecoratedLite;
	}

	let { data }: Props = $props();
</script>

{#if Array.isArray(data)}
	{#each data as arrayItem, ix (`${arrayItem}${ix}`)}
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
