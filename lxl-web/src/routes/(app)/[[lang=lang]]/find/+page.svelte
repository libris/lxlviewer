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
	<div class="flex gap-16 py-4 sm:py-8">
		<div class="hidden w-80 shrink-0 md:flex">
			<FacetSidebar facets={data.searchResult.facetGroups} />
		</div>
		<main class="max-w-content">
			<ul>
				{#each data.searchResult.items as item (item['@id'])}
					<li class="bg-cards">
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
