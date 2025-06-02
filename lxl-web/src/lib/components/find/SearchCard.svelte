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
	<article
		class="search-card border-neutral relative grid w-full gap-x-4 border-t px-0 py-3 font-normal transition-shadow md:px-4"
		data-testid="search-card"
	>
		<div class="card-image">
			<a
				href={id}
				aria-labelledby={titleId}
				aria-describedby={`${bodyId} ${footerId}`}
				tabindex="-1"
			>
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
						<!--
						{#if item['@type'] !== 'Text' && item['@type'] !== 'Person' && getTypeIcon(item['@type'])}
							<div class="absolute -top-4 -left-4">
								<div class="bg-page rounded-md p-1.5">
									<svelte:component this={getTypeIcon(item['@type'])} class="h-6 w-6" />
								</div>
							</div>
						{/if}
						-->
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
									class="absolute text-2xl text-neutral-400"
								/>
							{/if}
						</div>
					{/if}
				</div>
			</a>
		</div>
		<div class="card-content">
			<header class="card-header" id={titleId}>
				<p class="card-header-top">
					<svelte:component this={getTypeIcon(item['@type'])} class="text-2xs mb-0.25 inline" />
					<span class="font-medium">
						{item.typeStr}
					</span>
					<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
					<span class="divider">{' · '}</span>
					{#each item[LensType.WebCardHeaderTop]?._display as obj, index (index)}
						<span>
							<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} />
						</span>
					{/each}
				</p>
				<hgroup>
					<h2 class="card-header-title text-base font-medium">
						<a
							href={id}
							class="block underline decoration-neutral-400 decoration-dotted hover:decoration-solid focus:decoration-solid"
							aria-describedby={`${bodyId} ${footerId}`}
						>
							<DecoratedData data={item['card-heading']} showLabels={ShowLabelsOptions.Never} />
						</a>
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
				<div class="card-body mt-1 text-xs" id={bodyId}>
					{#each item[LxlLens.CardBody]?._display as obj, index (index)}
						<div>
							<DecoratedData data={obj} showLabels={ShowLabelsOptions.Never} block />
						</div>
					{/each}
				</div>
			{/if}
			<footer class="card-footer mt-1" id={footerId}>
				{#each item[LensType.WebCardFooter]?._display as obj, index (index)}
					{#if 'hasInstance' in obj}
						{@const instances = getInstanceData(obj.hasInstance)}
						{#if instances?.years}
							{#if instances.count > 1}
								{instances?.count}
								{$page.data.t('search.editions')}
								{`(${instances.years})`}
							{:else}
								{instances.years}
							{/if}
						{/if}
						{#if instances?.count === 1}
							<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
							<span class="divider">{' · '}</span>
							{#each obj.hasInstance._display as obj2, index (index)}
								<!-- FIXME we need publication for year, but don't want to show it again with the year -->
								{#if !obj2.publication}
									<DecoratedData data={obj2} showLabels={ShowLabelsOptions.Never} />
								{/if}
							{/each}
						{/if}
						{#if instances?.count === 1}
							<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
							<span class="divider">{' · '}</span>
							{#each obj.hasInstance._display as obj2, index (index)}
								<!-- FIXME we need publication for year, but don't want to show it again with the year -->
								{#if !obj2.publication}
									<DecoratedData data={obj2} showLabels={ShowLabelsOptions.Never} />
								{/if}
							{/each}
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
		grid-template-areas: 'image content debug libraries';
		grid-template-columns: 64px 1fr auto auto;

		@container (min-width: 768px) {
			@apply gap-x-6 px-6 py-4;
			grid-template-columns: 72px 1fr;
		}

		& :global(.contribution-role) {
			color: var(--color-subtle);
			font-size: var(--text-3xs);
		}
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

	.card-footer {
		/* hide dangling divider · */
		& .divider {
			display: none;
		}
		& :global(.divider:has(+ span)) {
			display: inline;
		}
	}

	.card-header-top,
	.card-header-extra,
	.card-footer,
	.card-header :global(.transliteration) {
		font-size: var(--text-2xs);
		color: var(--color-subtle);
		font-weight: var(--font-weight-normal);
	}
</style>
