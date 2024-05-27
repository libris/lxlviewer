<script lang="ts">
	import jmespath from 'jmespath';
	import type { SearchResultItem } from './search';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import type { ResourceData } from '$lib/types/ResourceData';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import { relativizeUrl } from '$lib/utils/http';
	import { LensType } from '$lib/utils/xl';
	import { LxlLens } from '$lib/utils/display.types';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import { page } from '$app/stores';

	export let item: SearchResultItem;

	$: id = relativizeUrl(item['@id']);
	$: titleId = `card-title-${id}`;
	$: bodyId = `card-body-${id}`;
	$: footerId = `card-footer-${id}`;

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

<div class="search-card-container">
	<article class="search-card">
		<!-- svelte-ignore a11y-missing-content -->
		<!-- (content shouldn't be needed as we're using aria-labelledby, see: https://github.com/sveltejs/svelte/issues/8296) -->
		<a
			class="card-link"
			href={id}
			aria-labelledby={titleId}
			aria-describedby={`${bodyId} ${footerId}`}
		></a>
		<div class="card-image">
			<div class="pointer-events-none relative flex h-full max-h-20 w-full max-w-20">
				{#if item.image}
					<img
						src={item.image.url}
						width={item.image.widthṔx}
						height={item.image.heightPx}
						alt={$page.data.t('general.latestInstanceCover')}
						class="h-auto w-full rounded-sm object-contain object-top"
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
						<img src={placeholder} alt="" class="h-20 w-20 rounded-sm object-contain" />
						{#if getTypeIcon(item['@type'])}
							<svelte:component
								this={getTypeIcon(item['@type'])}
								class="absolute text-xl text-icon"
							/>
						{/if}
					</div>
				{/if}
			</div>
		</div>
		<header class="card-header" id={titleId}>
			<hgroup>
				<h2 class="card-header-title">
					<DecoratedData data={item['card-heading']} showLabels={ShowLabelsOptions.Never} />
				</h2>
				<!-- TODO: add transliteration here 
				{#if item['_script']}
					<p>transliteration</p>
				{/if}
				-->
			</hgroup>
			{#if item[LensType.WebCardHeaderExtra]?._display}
				<p class="card-header-extra">
					{#each item[LensType.WebCardHeaderExtra]?._display as obj}
						<span>
							<DecoratedData data={obj} showLabels={ShowLabelsOptions.DefaultOn} />
						</span>
					{/each}
				</p>
			{/if}
		</header>
		{#if item[LxlLens.CardBody]?._display}
			<div class="card-body" id={bodyId}>
				{#each item[LxlLens.CardBody]?._display as obj}
					<div>
						<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} block />
					</div>
				{/each}
			</div>
		{/if}
		<footer class="card-footer" id={footerId}>
			<span class="font-bold">
				{item.typeStr}
			</span>
			{#each item[LensType.WebCardFooter]?._display as obj}
				{' • '}
				{#if 'hasInstance' in obj}
					{@const instances = getInstanceData(obj.hasInstance)}
					{#if instances?.years}
						<span>
							{#if instances.count > 1}
								{instances?.count}
								{$page.data.t('search.editions')}
								{`(${instances.years})`}
							{:else}
								{instances.years}
							{/if}
						</span>
					{/if}
				{:else}
					<span>
						<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} />
					</span>
				{/if}
			{/each}
		</footer>
	</article>
</div>

<style lang="postcss">
	.search-card-container {
		container-type: inline-size;
	}

	.search-card {
		@apply gap-x-4 border-b border-b-primary/16 p-5 transition-shadow;

		display: grid;
		width: 100%;
		position: relative;
		background: theme(backgroundColor.cards);
		border-radius: theme(borderRadius.md);
		grid-template-areas:
			'image header'
			'image body'
			'image footer';
		grid-template-columns: 64px 1fr;

		&:hover,
		&:focus-within {
			@apply shadow-lg;
		}

		@container (min-width: 768px) {
			grid-template-columns: 96px 1fr;
		}
	}

	.card-link {
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: 0;
		cursor: pointer;
	}

	:global(a):not(.card-link),
	:global(.definition) {
		position: relative; /* needed for supporting mouse events on links and definitions above card-link */
	}

	.card-image {
		grid-area: image;
	}

	.card-header {
		grid-area: header;
	}

	.card-body {
		grid-area: body;
		@apply text-sm;

		@container (min-width: 768px) {
			@apply text-base;
		}
	}

	.card-footer {
		grid-area: footer;
		@apply mt-1;
	}

	.card-header-title {
		@apply text-3-cond;
		& :global([data-property='mainTitle']) {
			@apply font-bold;
		}

		@container (min-width: 768px) {
			@apply text-4-cond;

			& :global([data-property='mainTitle']) {
				@apply font-bold;
			}
		}
	}

	.card-header-extra,
	.card-footer {
		@apply text-xs text-secondary;
		@container (min-width: 768px) {
			@apply text-sm;
		}
	}
</style>
