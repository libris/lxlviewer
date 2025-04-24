<script lang="ts">
	import type { SearchResultItem } from '$lib/types/search';
	import { LensType } from '$lib/types/xl';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { LxlLens } from '$lib/types/display';
	import { relativizeUrl } from '$lib/utils/http';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import getInstanceData from '$lib/utils/getInstanceData';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { page } from '$app/stores';
	import SearchItemDebug from '$lib/components/find/SearchItemDebug.svelte';
	import EsExplain from '$lib/components/find/EsExplain.svelte';
	import SearchItemDebugHaystack from '$lib/components/find/SearchItemDebugHaystack.svelte';
	import MyLibsHoldingIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';

	export let item: SearchResultItem;

	$: id = relativizeUrl(item['@id']);
	$: titleId = `card-title-${id}`;
	$: bodyId = `card-body-${id}`;
	$: footerId = `card-footer-${id}`;

	let showDebugExplain = false;
	let showDebugHaystack = false;
</script>

<div class="search-card-container">
	<article class="search-card" data-testid="search-card">
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
							? 'aspect-2/3'
							: 'aspect-square'}"
					/>
					{#if item['@type'] !== 'Text' && item['@type'] !== 'Person' && getTypeIcon(item['@type'])}
						<div class="absolute -top-4 -left-4">
							<div class="rounded-md p-1.5">
								<svelte:component this={getTypeIcon(item['@type'])} class="h-6 w-6" />
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
							<svelte:component this={getTypeIcon(item['@type'])} class="absolute text-lg" />
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
						{#each item[LensType.WebCardHeaderExtra]?._display as obj, index (index)}
							<span>
								<DecoratedData data={obj} showLabels={ShowLabelsOptions.DefaultOn} />
							</span>
						{/each}
					</p>
				{/if}
			</header>
			{#if item[LxlLens.CardBody]?._display}
				<div class="card-body" id={bodyId}>
					{#each item[LxlLens.CardBody]?._display as obj, index (index)}
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
				<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
				<span class="divider">{' • '}</span>
				{#each item[LensType.WebCardFooter]?._display as obj, index (index)}
					{#if 'hasInstance' in obj}
						<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
						<span class="divider">{' • '}</span>
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
		{#if item._debug}
			{#key item._debug}
				<div class="card-debug z-20 self-start text-left select-text">
					<SearchItemDebug debugInfo={item._debug} />
					<button
						type="button"
						class="text-xs"
						on:click={() => {
							showDebugHaystack = !showDebugHaystack;
						}}
					>
						Haystack
					</button>
					<button
						type="button"
						class="text-xs"
						on:click={() => {
							showDebugExplain = !showDebugExplain;
						}}
					>
						Explain
					</button>
				</div>
				{#if showDebugHaystack}
					<div class="z-20 col-span-full row-start-2 pt-4">
						<SearchItemDebugHaystack debugInfo={item._debug} />
					</div>
				{/if}
				{#if showDebugExplain}
					<div class="z-20 col-span-full row-start-2 pt-4">
						<EsExplain explain={item._debug.score.explain} />
					</div>
				{/if}
			{/key}
		{/if}
		{#if item.heldByMyLibraries?.length}
			<div class="card-libraries flex items-start">
				<MyLibsHoldingIndicator libraries={item.heldByMyLibraries} />
			</div>
		{/if}
	</article>
</div>

<style lang="postcss">
	@reference "../../../app.css";

	.search-card-container {
		container-type: inline-size;
	}

	.search-card {
		@apply border-neutral relative grid w-full gap-x-4 rounded-md border-b px-4 pt-3 pb-3 font-normal transition-shadow;

		grid-template-areas: 'image content debug libraries';
		grid-template-columns: 64px 1fr auto auto;

		&:hover,
		&:focus-within {
			@apply shadow-lg;

			& .card-header-title {
			}
		}

		@container (min-width: 768px) {
			@apply gap-x-6 px-6 pt-4 pb-6;
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
	.card-header-extra :global(> span),
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

	.card-debug {
		grid-area: extra;
	}

	.card-libraries {
		grid-area: libraries;
	}

	.card-body {
		@apply text-sm;

		@container (min-width: 768px) {
			@apply mt-2 text-base;
		}
	}

	.card-footer {
		@apply mt-1;

		@container (min-width: 768px) {
			@apply mt-3;
		}

		/* hide dangling divider • */
		& .divider {
			@apply hidden;
		}
		& :global(.divider:has(+ span)) {
			@apply inline;
		}
	}

	.card-header-title {
		@container (min-width: 768px) {
		}
	}

	.card-header-extra,
	.card-footer,
	.card-header :global([data-property='_script']) {
		@apply text-xs;
		@container (min-width: 768px) {
			@apply text-sm;
		}
	}

	/** TODO: Set transliteration styling via display-web.json? */
	:global(.card-header [data-property='_script']) {
		@apply italic;
		display: block;
	}
</style>
