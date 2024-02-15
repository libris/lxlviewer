<script lang="ts">
	import { relativize } from '$lib/utils/http';
	import { getFilteredEntries, getResourcePropertyStyle } from '$lib/utils/resourceData';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { LxlLens } from '$lib/utils/display.types';
	import type { ResourceData } from '$lib/types/ResourceData';

	export let item: ResourceData;
	const hiddenProperties = ['_label', '_style'];

	function getClasses(obj: ResourceData) {
		const style = getResourcePropertyStyle(obj);
		return style ? style.join(' ') : '';
	}

	console.log(item[LxlLens.CardBody]._display);
</script>

<li class="search-card flex flex-col gap-2 rounded-md border-b border-b-primary/16 bg-cards p-6">
	<!-- card heading -->
	<a href={relativize(item['@id'])} class="text-primary no-underline text-3-cond-bold"
		><h2>
			<DecoratedData data={item[LxlLens.CardHeading]} />
		</h2></a
	>
	<!-- card body -->
	<div class="search-card-body">
		{#each item[LxlLens.CardBody]._display as obj}
			<div class="search-card-group {getClasses(obj)}">
				<p class="search-card-label mb-1 text-secondary">{obj?._label}</p>
				<!-- eslint-disable-next-line no-empty @typescript-eslint/no-unused-vars -->
				{#each getFilteredEntries(obj, hiddenProperties) as [key, value]}
					{#if Array.isArray(value)}
						{#each value as v}
							<div class="search-card-value">
								<DecoratedData data={v} />
							</div>
						{/each}
					{:else}
						<div class="search-card-value">
							<DecoratedData data={value} />
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</li>

<style>
	.search-card-body {
		@apply grid grid-cols-3 gap-4 text-2-regular;
		grid-template-areas: 'head nav foot';
	}

	.search-card-group.nolabel .search-card-label {
		@apply hidden;
	}

	.search-card-group.pill .search-card-value {
		@apply m-1 inline-block rounded-md border border-accent-dark p-1;
	}
</style>
