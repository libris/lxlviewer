<script lang="ts">
	import jmespath from 'jmespath';
	import { relativizeUrl } from '$lib/utils/http';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { ResourceData } from '$lib/types/ResourceData';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import { page } from '$app/stores';
	import placeholderBook from '$lib/assets/img/placeholder-book.svg';

	export let item: {
		'@id': string;
		'card-heading': ResourceData;
		'card-body': ResourceData;
		imageUri: string;
	};
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
	class="flex gap-8 rounded-md border-b border-b-primary/16 bg-cards p-6"
	data-testid="search-card"
>
	<a href={relativizeUrl(item['@id'])}>
		<div class="flex h-full max-h-20 w-full max-w-20">
			{#if item.imageUri}
				<img
					src={item.imageUri}
					alt={$page.data.t('general.latestInstanceCover')}
					class="h-auto w-full object-contain"
				/>
			{:else}
				<img src={placeholderBook} alt="" class="h-auto w-full object-contain" />
			{/if}
		</div>
	</a>

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
