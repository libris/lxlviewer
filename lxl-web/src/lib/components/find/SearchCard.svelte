<script lang="ts">
	import jmespath from 'jmespath';
	import type { SearchResultItem } from '$lib/types/search';
	import type { ResourceData } from '$lib/types/resourceData';
	import { LensType } from '$lib/types/xl';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { LxlLens } from '$lib/types/display';

	import { relativizeUrl } from '$lib/utils/http';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
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
	<article class="search-card" data-testid="search-card">
		<!-- svelte-ignore a11y-missing-content -->
		<!-- (content shouldn't be needed as we're using aria-labelledby, see: https://github.com/sveltejs/svelte/issues/8296) -->
		<a
			class="card-link"
			href={id}
			aria-labelledby={titleId}
			aria-describedby={`${bodyId} ${footerId}`}
		></a>
		<div class="card-image">
			<div class="pointer-events-none relative flex">
				{#if item.image}
					<img
						src={item.image.url}
						width={item.image.widthṔx}
						height={item.image.heightPx}
						alt={$page.data.t('general.latestInstanceCover')}
						class:rounded-full={item['@type'] === 'Person'}
						class="object-contain object-top {item['@type'] !== 'Person'
							? 'aspect-[2/3]'
							: 'aspect-square'}"
					/>
					{#if item['@type'] !== 'Text' && item['@type'] !== 'Person' && getTypeIcon(item['@type'])}
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
						<img
							src={placeholder}
							alt=""
							class:rounded-full={item['@type'] === 'Person'}
							class:rounded-sm={item['@type'] !== 'Person'}
							class="object-contain object-top"
						/>
						{#if getTypeIcon(item['@type'])}
							<svelte:component
								this={getTypeIcon(item['@type'])}
								class="absolute text-lg text-icon"
							/>
						{/if}
					</div>
				{/if}
			</div>
		</div>
		<div class="card-content">
			<header class="card-header" id={titleId}>
				<hgroup>
					<h2 class="card-header-title">
						<DecoratedData data={item['card-heading']} showLabels={ShowLabelsOptions.Never} />
					</h2>
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
					<span>{' • '}</span>
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
		</div>
	</article>
</div>

<style lang="postcss">
	.search-card-container {
		container-type: inline-size;
	}

	.search-card {
		@apply gap-x-4 border-b border-b-primary/16 px-4 pb-3 pt-3 transition-shadow;

		display: grid;
		width: 100%;
		position: relative;
		background: theme(backgroundColor.cards);
		border-radius: theme(borderRadius.md);
		grid-template-areas: 'image content';
		grid-template-columns: 64px 1fr;

		&:hover,
		&:focus-within {
			@apply shadow-lg;

			& .card-header-title {
				@apply text-hover;
			}
		}

		@container (min-width: 768px) {
			@apply gap-x-6 px-6 pb-6 pt-4;
			grid-template-columns: 72px 1fr;
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
	.card-body :global(span:first-of-type),
	.card-footer :global(> span) {
		position: relative; /* needed for supporting mouse events on text, links and definitions above card-link */
	}

	.card-image {
		grid-area: image;
	}

	.card-content {
		grid-area: content;
	}

	.card-body {
		@apply text-sm;

		@container (min-width: 768px) {
			@apply mt-2 text-base;
		}
	}

	.card-footer {
		@apply mt-auto pt-1;

		@container (min-width: 768px) {
			@apply pt-3;
		}
	}

	.card-header-title {
		@apply text-link text-3-cond;
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
	.card-footer,
	.card-header :global([data-property='_script']) {
		@apply text-xs text-secondary;
		@container (min-width: 768px) {
			@apply text-sm;
		}
	}

	/** TODO: Set transliteration styling via display-web.json? */
	:global(.card-header [data-property='_script']) {
		display: block;
	}
</style>
