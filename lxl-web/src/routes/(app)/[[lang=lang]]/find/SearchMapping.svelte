<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import type { DisplayMapping } from './search';
	export let mapping: DisplayMapping[];

	$: filteredMapping = mapping.filter((m) => m);
</script>

<ul class="flex flex-wrap gap-2 overflow-hidden">
	{#each filteredMapping as filter}
		<li class="flex min-h-9 items-center gap-2 rounded-md bg-positive-inv px-3">
			<span class="overflow-hidden text-ellipsis">
				<span class="text-secondary-inv text-2-regular">{filter.label}</span>
				<span class="font-bold text-primary-inv">
					<DecoratedData data={filter.display} showLabels={ShowLabelsOptions['Never']} />
				</span>
			</span>
			{#if 'up' in filter}
				<a class="text-secondary-inv visited:text-secondary-inv" href={filter.up?.['@id']}>x</a>
			{/if}
		</li>
	{/each}
</ul>
