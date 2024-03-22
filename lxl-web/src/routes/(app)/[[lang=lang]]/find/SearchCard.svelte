<script lang="ts">
	import jmespath from 'jmespath';
	import { relativizeUrl } from '$lib/utils/http';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { ResourceData } from '$lib/types/ResourceData';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	export let item: { '@id': string; 'card-heading': ResourceData; 'card-body': ResourceData };

	function getInstanceData(instances: ResourceData) {
		if (typeof instances === 'object') {
			let count = 1;
			let query = '_display[].publication[].*[][?year].year[]';

			if (Array.isArray(instances)) {
				count = instances.length;
				query = '[]._display[].publication[].*[][?year].year[]';
			}

			let years = jmespath.search(instances, query);
			if (years) {
				years = years
					.filter((el: string) => !isNaN(parseInt(el)))
					.sort()
					.filter((el: string, i: number) => el && (i === 0 || i === years.length - 1))
					.join('-');
			}
			return { count, years };
		}
		return null;
	}
</script>

<li
	class="flex gap-8 rounded-md border-b border-b-primary/16 bg-cards p-6"
	data-testid="search-card"
>
	<div class="flex h-[6.5rem] w-20 shrink-0 items-center justify-center rounded-sm bg-[lightgrey]">
		Image
	</div>
	<div class="flex flex-col gap-2">
		<a
			href={relativizeUrl(item['@id'])}
			class="search-card-heading line-clamp-2 text-ellipsis text-secondary no-underline text-4-regular"
			data-testid="search-card-heading"
			><h2>
				<DecoratedData data={item['card-heading']} showLabels={ShowLabelsOptions.Never} />
			</h2></a
		>
		<div class="search-card-body flex items-baseline gap-2">
			{#each item['card-body']?._display as obj}
				<div class="rounded-md bg-pill/4 p-2">
					{#if 'hasInstance' in obj}
						{@const instances = getInstanceData(obj.hasInstance)}
						{#if instances}
							<span>
								{instances?.count}
								{instances.count > 1 ? 'utgåvor' : 'utgåva'}
								{instances?.years && `(${instances.years})`}
							</span>
						{/if}
					{:else}
						<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} block truncate />
					{/if}
				</div>
			{/each}
		</div>
	</div>
</li>

<style>
	.search-card-heading {
		& :global([data-property='mainTitle']) {
			@apply text-4-cond-bold;
		}

		&:not(:visited) {
			& :global([data-property='mainTitle']) {
				@apply text-primary;
			}
		}
	}

	.search-card-body {
		/* hide formatting */
		& :global([data-property='contribution'] ._contentBefore),
		:global([data-property='contribution'] ._contentAfter),
		:global([data-property='role']) {
			@apply hidden;
		}

		/* ...except for agents */
		& :global([data-property='agent'] ._contentBefore),
		:global([data-property='agent'] ._contentBefore) {
			@apply inline;
		}
	}
</style>
