<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { DisplayMapping } from './search';
	export let mapping: DisplayMapping[];

	$: filteredMapping = mapping.filter((m) => m);
</script>

<ul class="my-4 flex">
	{#each filteredMapping as filter}
		<li class="my-2 mr-2 justify-center rounded-md border border-primary px-3">
			<span class="text-2-regular">{filter.label}:</span>
			<span class="text-2-cond-bold"><DecoratedData data={filter.display} /></span>
			{#if 'up' in filter}
				<a class="underline" href={filter.up?.['@id']}>x</a>
			{/if}
		</li>
	{/each}
</ul>
