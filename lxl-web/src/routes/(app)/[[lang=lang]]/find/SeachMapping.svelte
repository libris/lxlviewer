<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import type { DisplayMapping } from './search';
	export let mapping: DisplayMapping[];
</script>

<!-- <section>
	<ul class="container-fluid bg-transparent flex flex-wrap gap-2 py-4">
		{#each filteredMapping as filter}
			<li class="justify-center rounded-md bg-positive-inv px-4 py-2">
				<span class="mr-2">
					<span class="text-secondary-inv text-2-regular">{filter.label}</span>
					<span class="font-bold text-primary-inv"
						><DecoratedData data={filter.display} showLabels={ShowLabelsOptions['Never']} /></span
					>
				</span>
				{#if 'up' in filter}
					<a class="text-secondary-inv visited:text-secondary-inv" href={filter.up?.['@id']}>x</a>
				{/if}
			</li>
		{/each}
	</ul>
</section> -->

<ul class="flex flex-wrap items-center gap-2 rounded-sm p-2">
	{#each mapping as m}
		<li class="flex items-center gap-1 bg-pill/4 p-1 hover:bg-pill/8">
			{#if 'children' in m}
				<span class="text-[red]">{m.operator}</span>
				<svelte:self mapping={m.children} />
			{:else if 'label' in m && 'display' in m}
				<span>{m.label}</span>
				<span class="text-[red]">{m.operator}</span>
				<DecoratedData data={m.display} showLabels={ShowLabelsOptions['Never']} />
			{/if}
			{#if 'up' in m}
				<a class="" href={m.up?.['@id']}>x</a>
			{/if}
		</li>
	{/each}
</ul>
