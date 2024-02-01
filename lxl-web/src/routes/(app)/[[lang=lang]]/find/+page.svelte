<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { LxlLens } from '$lib/utils/display.types';
	import { relativize } from '$lib/utils/http';
	import FilterPanel from './FilterPanel.svelte';
	import FiltersActive from './FiltersActive.svelte';

	export let data;
</script>

<div class="m-3">
	<FiltersActive mapping={data.searchResult.mapping} />
	<div class="flex">
		<FilterPanel facets={data.searchResult.facetGroups} />
		<main class="w-10/12">
			<ul>
				{#each data.searchResult.items as item (item['@id'])}
					<li>
						<a href={relativize(item['@id'])}
							><h2 class="text-4-cond-extrabold">
								<DecoratedData data={item[LxlLens.CardHeading]} />
							</h2></a
						>
						<DecoratedData data={item[LxlLens.CardBody]} />
					</li>
					<br />
				{/each}
			</ul>
		</main>
	</div>
</div>
