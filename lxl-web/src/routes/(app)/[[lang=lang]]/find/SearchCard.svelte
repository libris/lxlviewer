<script lang="ts">
	import { relativize } from '$lib/utils/http';
	import { getFilteredEntries, getResourcePropertyStyle } from '$lib/utils/resourceData';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { LxlLens } from '$lib/utils/display.types';
	import type { ResourceData } from '$lib/types/ResourceData';

	export let item: ResourceData;

	const hiddenProperties = ['_label', '_style', '_contentBefore'];
	const bodyDisplay = item[LxlLens.CardBody]?._display;

	function getClasses(obj: ResourceData) {
		const style = getResourcePropertyStyle(obj);
		return style ? style.join(' ') : '';
	}
</script>

<li class="search-card flex flex-col gap-2 rounded-md border-b border-b-primary/16 bg-cards p-6">
	<!-- card heading -->
	<a href={relativize(item['@id'])} class="font-bold text-primary no-underline"
		><h2>
			<DecoratedData data={item[LxlLens.CardHeading]} />
		</h2></a
	>
	<!-- card body -->
	<div class="search-card-body">
		{#each bodyDisplay as obj}
			{#each getFilteredEntries(obj, hiddenProperties) as [key, value]}
				<div class="search-card-group {getClasses(obj)}" data-property={key}>
					<p class="search-card-label mb-1 text-secondary">{obj?._label}</p>
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
				</div>
			{/each}
		{/each}
	</div>
</li>

<style>
	.search-card-body {
		@apply grid grid-cols-3 gap-6;
		grid-template-areas:
			'contribution hasInstance subject'
			'genreForm classification contentType';
	}

	[data-property='contribution'] {
		grid-area: contribution;
	}

	[data-property='hasInstance'] {
		grid-area: hasInstance;
	}

	[data-property='subject'] {
		grid-area: subject;
	}

	[data-property='genreForm'] {
		grid-area: genreForm;
	}

	[data-property='classification'] {
		grid-area: classification;
	}

	[data-property='contentType'] {
		grid-area: contentType;
	}

	.search-card-group.nolabel .search-card-label {
		@apply hidden;
	}

	.search-card-group.pill {
		@apply flex flex-wrap items-start gap-1;
	}

	.search-card-group.pill .search-card-value {
		@apply rounded-md border border-accent-dark p-1;
	}
</style>
