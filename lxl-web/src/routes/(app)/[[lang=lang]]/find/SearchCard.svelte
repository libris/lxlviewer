<script lang="ts">
	import { relativizeUrl } from '$lib/utils/http';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { ResourceData } from '$lib/types/ResourceData';

	export let item: ResourceData;
</script>

<li class="search-card flex flex-col gap-2 rounded-md border-b border-b-primary/16 bg-cards p-6">
	<a href={relativizeUrl(item['@id'])} class="font-bold text-primary no-underline"
		><h2>
			<DecoratedData data={item['card-heading']} />
		</h2></a
	>
	<div class="search-card-body">
		<DecoratedData data={item['card-body']} block />
	</div>
</li>

<style>
	.search-card-body {
		& :global(> div) {
			@apply grid grid-cols-3 gap-6;

			grid-template-areas:
				'contribution language subject'
				'genreForm classification contentType';
		}

		& :global(small) {
			@apply block font-normal text-secondary;

			&::first-letter {
				@apply capitalize;
			}
		}

		& :global([data-property='contribution'] > ._contentBefore),
		:global([data-property='contribution'] > ._contentAfter) {
			@apply hidden;
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
