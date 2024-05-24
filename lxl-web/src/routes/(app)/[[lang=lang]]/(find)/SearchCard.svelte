<script lang="ts">
	import jmespath from 'jmespath';
	import { relativizeUrl } from '$lib/utils/http';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { ResourceData } from '$lib/types/ResourceData';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import { page } from '$app/stores';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import type { SearchResultItem } from './search';
	import { LxlLens } from '$lib/utils/display.types';
	import { LensType } from '$lib/utils/xl';

	export let item: SearchResultItem;

	function getInstanceData(instances: ResourceData) {
		if (typeof instances === 'object') {
			let years: string = '';
			let count = 1;
			let query = '_display[].publication[].*[][?year].year[]';

			if (Array.isArray(instances)) {
				count = instances.length;
				query = '[]._display[].publication[].*[][?year].year[]';
			}

			let res = jmespath.search(instances, query) as string[] | null;
			if (res) {
				years = res
					.filter((el, i, arr) => !isNaN(parseInt(el)) && arr.indexOf(el) === i)
					.sort()
					.filter((el, i, arr) => i === 0 || i === arr.length - 1)
					.join('-');
			}

			return { count, years };
		}
		return null;
	}
</script>

<li
	class="flex gap-4 border-b border-b-primary/16 bg-cards p-4 sm:gap-8 sm:p-6 md:rounded-md"
	data-testid="search-card"
>
	<a href={relativizeUrl(item['@id'])}>
		<div class="relative flex h-full max-h-32 w-full max-w-20">
			{#if item.image}
				<img
					src={item.image.url}
					width={item.image.widthṔx}
					height={item.image.heightPx}
					alt={$page.data.t('general.latestInstanceCover')}
					class="h-auto w-full rounded-sm object-cover object-top"
				/>
				{#if item['@type'] !== 'Text' && getTypeIcon(item['@type'])}
					<div class="absolute -left-4 -top-4">
						<div class="rounded-md bg-cards p-1.5">
							<svelte:component
								this={getTypeIcon(item['@type'])}
								class="h-6 w-6 text-icon-strong"
							/>
						</div>
					</div>
				{/if}
			{:else}
				<div class="flex items-center justify-center">
					<img src={placeholder} alt="" class="h-20 w-20 rounded-sm object-cover" />
					{#if getTypeIcon(item['@type'])}
						<svelte:component
							this={getTypeIcon(item['@type'])}
							class="absolute text-xl text-icon"
						/>
					{/if}
				</div>
			{/if}
		</div>
	</a>

	<div class="flex flex-1 flex-col gap-1 sm:gap-2">
		<a
			href={relativizeUrl(item['@id'])}
			class="search-card-heading line-clamp-1 text-ellipsis no-underline text-4-regular sm:line-clamp-2"
			data-testid="search-card-heading"
			><h2>
				<DecoratedData data={item['card-heading']} showLabels={ShowLabelsOptions.Never} />
			</h2>
		</a>
		header-extra:
		<div class="search-card-body flex flex-col items-baseline gap-1 sm:flex-row sm:gap-2">
			{#each item[LensType.WebCardHeaderExtra]?._display as obj}
				<div
					class="search-card-prop line-clamp-1 sm:line-clamp-2 sm:rounded-md sm:bg-pill/4 sm:p-2"
				>
					<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} block />
				</div>
			{/each}
		</div>
		body:
		<div class="search-card-body flex flex-col items-baseline gap-1 sm:flex-row sm:gap-2">
			{#each item[LxlLens.CardBody]?._display as obj}
				<div
					class="search-card-prop line-clamp-1 sm:line-clamp-2 sm:rounded-md sm:bg-pill/4 sm:p-2"
				>
					<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} block />
				</div>
			{/each}
		</div>
		footer:
		<div class="search-card-body flex flex-col items-baseline gap-1 sm:flex-row sm:gap-2">
			<div class="search-card-prop line-clamp-1 sm:line-clamp-2 sm:rounded-md sm:bg-pill/4 sm:p-2">
				{item.typeStr}
			</div>
			{#each item[LensType.WebCardFooter]?._display as obj}
				{#if 'hasInstance' in obj}
					{@const instances = getInstanceData(obj.hasInstance)}
					{#if instances?.years}
						<div
							class="search-card-prop line-clamp-1 sm:line-clamp-2 sm:rounded-md sm:bg-pill/4 sm:p-2"
						>
							<span>
								{#if instances.count > 1}
									{instances?.count}
									{$page.data.t('search.editions')}
									{`(${instances.years})`}
								{:else}
									{instances.years}
								{/if}
							</span>
						</div>
					{/if}
				{:else}
					<div
						class="search-card-prop line-clamp-1 sm:line-clamp-2 sm:rounded-md sm:bg-pill/4 sm:p-2"
					>
						<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} block truncate />
					</div>
				{/if}
			{/each}
		</div>
	</div>
</li>

<style lang="postcss">
	.search-card-heading {
		& :global([data-property='mainTitle']) {
			@apply text-4-cond-bold;
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

	/* Hide lang on small screens */
	.search-card-prop:has([data-property='language']) {
		@apply hidden sm:inline;
	}
</style>
