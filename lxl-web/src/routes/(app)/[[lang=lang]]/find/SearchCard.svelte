<script lang="ts">
	import { relativizeUrl } from '$lib/utils/http';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { LxlLens } from '$lib/utils/display.types';
	import type { ResourceData } from '$lib/types/ResourceData';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';

	export let item: ResourceData;

	const bodyDisplay = item[LxlLens.CardBody]?._display;
</script>

<li class="search-card flex flex-col gap-2 rounded-md border-b border-b-primary/16 bg-cards p-6">
	<a href={relativizeUrl(item['@id'])} class="font-bold text-primary no-underline"
		><h2>
			<DecoratedData data={item[LxlLens.CardHeading]} showLabels={ShowLabelsOptions['Never']} />
		</h2></a
	>
	<div class="search-card-body">
		{#each bodyDisplay as i}
			<DecoratedData data={i} showLabels={ShowLabelsOptions['ByPropertyStyle']} block />
		{/each}
	</div>
</li>

<style>
	.search-card-body {
		@apply grid grid-cols-3 gap-6;

		grid-template-areas:
			'contribution hasInstance subject'
			'genreForm classification contentType';

		& :global(strong) {
			@apply block font-normal text-secondary;

			&::first-letter {
				@apply capitalize;
			}
		}

		& :global([data-property='contribution']) {
			grid-area: contribution;
		}

		& :global([data-property='hasInstance']) {
			grid-area: hasInstance;
		}

		& :global([data-property='subject']) {
			grid-area: subject;
		}

		& :global([data-property='genreForm']) {
			grid-area: genreForm;
		}

		& :global([data-property='classification']) {
			grid-area: classification;
		}

		& :global([data-property='contentType']) {
			grid-area: contentType;
		}
	}
</style>
