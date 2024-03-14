<script lang="ts">
	import { relativizeUrl } from '$lib/utils/http';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { ResourceData } from '$lib/types/ResourceData';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	export let item: ResourceData;
</script>

<li class="flex gap-8 rounded-md border-b border-b-primary/16 bg-cards p-6">
	<div class="flex h-[6.5rem] w-20 shrink-0 items-center justify-center rounded-sm bg-[lightgrey]">
		Image
	</div>
	<div class="flex flex-col gap-2">
		<a href={relativizeUrl(item['@id'])} class="search-card-heading"
			><h2>
				<DecoratedData data={item['card-heading']} showLabels={ShowLabelsOptions.Never} />
			</h2></a
		>
		<div class="search-card-body">
			<DecoratedData data={item['card-body']} showLabels={ShowLabelsOptions.Never} block />
		</div>
	</div>
</li>

<style>
	.search-card-heading {
		@apply line-clamp-2 text-ellipsis text-primary no-underline text-4-regular;

		& :global([data-property='mainTitle']) {
			@apply text-4-cond-bold;
		}
	}
	.search-card-body {
		& :global(> div) {
			@apply grid grid-cols-3 gap-6;

			grid-template-areas: 'contribution language hasInstance';
		}

		/* hide formatting */
		& :global([data-property='contribution'] ._contentBefore),
		:global([data-property='contribution'] ._contentAfter),
		:global([data-property='role']) {
			@apply hidden;
		}

		/* ...except for agents */
		& :global([data-property='agent'] ._contentBefore),
		& :global([data-property='agent'] ._contentBefore) {
			@apply inline;
		}

		& :global([data-property='contribution'] > *) {
			@apply block;
		}

		& :global([data-property='contribution']) {
			grid-area: contribution;
		}

		& :global([data-property='language']) {
			grid-area: language;
		}

		& :global([data-property='hasInstance']) {
			grid-area: hasInstance;
		}
	}
</style>
