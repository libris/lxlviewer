<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { DisplayMapping } from './search';
	export let mapping: DisplayMapping[];

	$: filteredMapping = mapping.filter((m) => m);
</script>

<section>
	<ul class="container-fluid bg-transparent flex flex-wrap gap-2 py-4">
		{#each filteredMapping as filter}
			<li class="justify-center rounded-md bg-positive-inv px-4 py-2">
				<span class="mr-2">
					<span class="text-secondary-inv text-2-regular">{filter.label}</span>
					<span class="text-primary-inv text-2-cond-bold"
						><DecoratedData data={filter.display} /></span
					>
				</span>
				{#if 'up' in filter}
					<a class="text-secondary-inv" href={filter.up?.['@id']}>x</a>
				{/if}
			</li>
		{/each}
	</ul>
</section>
