<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import type { DisplayMapping } from './search';
	export let mapping: DisplayMapping[];

	$: filteredMapping = mapping.filter((m) => m);
</script>

<section>
	<ul class="container-fluid bg-transparent flex flex-wrap gap-2 py-4">
		{#each filteredMapping as filter}
			<li class="justify-center rounded-md bg-positive-inv px-4 py-2">
				<span class="mr-2">
					<span class="text-secondary-inv">{filter.label}</span>
					<span class="font-bold text-primary-inv"
						><DecoratedData data={filter.display} showLabels={ShowLabelsOptions['Never']} /></span
					>
				</span>
				{#if 'up' in filter}
					<a class="text-secondary-inv" href={filter.up?.['@id']}>x</a>
				{/if}
			</li>
		{/each}
	</ul>
</section>
