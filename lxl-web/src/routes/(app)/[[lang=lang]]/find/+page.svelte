<script lang="ts">
	import SeachMapping from './SeachMapping.svelte';
	import FacetSidebar from './FacetSidebar.svelte';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { LxlLens } from '$lib/utils/display.types';
	import { relativize } from '$lib/utils/http';

	export let data;
</script>

<SeachMapping mapping={data.searchResult.mapping} />
<div class="container-fluid">
	<div class="mx-auto grid max-w-content grid-cols-4 gap-8 py-4 sm:py-8">
		<FacetSidebar facets={data.searchResult.facetGroups} />
		<main class="col-span-3">
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
