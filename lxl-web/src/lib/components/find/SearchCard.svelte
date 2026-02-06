<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';
	import { goto, onNavigate, replaceState } from '$app/navigation';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { LibraryResultItem, SearchResultItem } from '$lib/types/search';
	import { JsonLd, LensType } from '$lib/types/xl';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { LxlLens } from '$lib/types/display';
	import { relativizeUrl, trimSlashes, stripAnchor } from '$lib/utils/http';
	import getInstanceData from '$lib/utils/getInstanceData';
	import placeholder from '$lib/assets/img/placeholder.svg';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { page } from '$app/state';
	import SearchItemDebug from '$lib/components/find/SearchItemDebug.svelte';
	import EsExplain from '$lib/components/find/EsExplain.svelte';
	import SearchItemDebugHaystack from '$lib/components/find/SearchItemDebugHaystack.svelte';
	import MyLibsHoldingIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';
	import { getHoldingsLink, handleClickHoldings } from '$lib/utils/holdings';
	import { asAdjecentSearchResult } from '$lib/utils/adjecentSearchResult';
	import TypeIcon from '$lib/components/TypeIcon.svelte';
	import { getCiteLink, handleClickCite } from '$lib/utils/citation';
	import BiHouse from '~icons/bi/house';
	import BiQuote from '~icons/bi/quote';
	import BiHeartFill from '~icons/bi/heart-fill';
	import BiHeart from '~icons/bi/heart';
	import { bookAspectRatio } from '$lib/utils/getTypeLike';

	interface Props {
		item: SearchResultItem | LibraryResultItem;
		uidPrefix?: string;
		allowPopovers?: boolean;
		allowLinks?: boolean;
		allowActions?: boolean;
	}

	let articleElement: HTMLElement;
	let {
		item,
		uidPrefix = '',
		allowPopovers = true,
		allowLinks = true,
		allowActions = true
	}: Props = $props();

	let id = $derived(`${uidPrefix}${stripAnchor(trimSlashes(relativizeUrl(item['@id'])))}`);
	let titleId = $derived(`card-title-${id}`);
	let bodyId = $derived(`card-body-${id}`);
	let footerId = $derived(`card-footer-${id}`);
	let modalParam = $derived(
		page.url.searchParams.get('holdings') ||
			page.state.holdings ||
			page.url.searchParams.get('cite') ||
			page.state.citationId
	);
	let showHighlight = $derived(
		(!page.state.dimissedHighlighting && page.url.hash === `#${id}`) || modalParam === id
	);

	// better way to check if data is an instance?
	const isInstanceCard = $derived(
		item[JsonLd.TYPE] === 'PhysicalResource' || item[JsonLd.TYPE] === 'DigitalResource'
	);

	const resourceLink = $derived.by(() => {
		const url = new URL(page.url.origin + page.data.localizeHref(id));
		// pass on _q to resource page
		const _q = page.url.searchParams.get('_q')?.trim();
		if (_q && _q !== '*') {
			url.searchParams.append('_q', _q);
			return url.toString();
		}
		return url.toString();
	});

	let showDebugExplain = $state(false);
	let showDebugHaystack = $state(false);

	function passAlongAdjecentSearchResults(event: MouseEvent) {
		event.preventDefault();
		goto((event.currentTarget as HTMLAnchorElement).href, {
			state: {
				...page.state,
				adjecentSearchResults: page.data.searchResult
					? [asAdjecentSearchResult(page.data.searchResult)]
					: [] // TODO: save adjecent results together with optional pane references so it will work with multiple panes
			}
		});
	}

	function handleRemoveHighlighting(event: MouseEvent) {
		if (event.target && !articleElement.contains(event.target as Node)) {
			document?.removeEventListener('click', handleRemoveHighlighting);
			replaceState(page.url.pathname + page.url.search + page.url.hash, {
				...page.state,
				dimissedHighlighting: true
			});
		}
	}

	function isLibraryCard(item: SearchResultItem | LibraryResultItem): item is LibraryResultItem {
		if (item[JsonLd.TYPE] !== 'Library' && item[JsonLd.TYPE] !== 'bibdb:Organization') return false;
		if (!('libraryId' in item) || !('displayStr' in item)) return false;
		return true;
	}

	$effect(() => {
		if (showHighlight && page.data.locale) {
			document?.addEventListener('click', handleRemoveHighlighting);
		}
	});

	onDestroy(() => {
		if (browser) document?.removeEventListener('click', handleRemoveHighlighting);
	});

	onNavigate(() => {
		document?.removeEventListener('click', handleRemoveHighlighting);
	});
</script>

<!--//TODO: look into using grid template areas + container queries instead
see https://github.com/libris/lxlviewer/pull/1336/files/c2d45b319782da2d39d0ca0c23e223cdda91b17a -->

{#snippet holdingsButton()}
	{#if id && item.numberOfHolders >= 0}
		<a
			class="btn btn-primary h-7 rounded-full md:h-8"
			href={page.data.localizeHref(getHoldingsLink(page.url, id))}
			data-sveltekit-preload-data={isInstanceCard ? 'false' : ''}
			data-sveltekit-noscroll
			data-testid="holding-link"
			onclick={(event) => isInstanceCard && handleClickHoldings(event, page.state, id)}
		>
			<span class="text-base">
				{#if item.heldByMyLibraries}
					<MyLibsHoldingIndicator libraries={item.heldByMyLibraries} />
				{:else}
					<BiHouse class="text-neutral-400" />
				{/if}
			</span>
			{item.numberOfHolders}
			{page.data.t('search.libraries')}
		</a>
	{/if}
{/snippet}

<div class="search-card-container @container/card">
	<article
		{id}
		class={[
			'search-card border-neutral relative grid w-full gap-x-4 border-t px-3 py-3 font-normal transition-colors',
			showHighlight && 'bg-accent-50/75'
		]}
		aria-current={showHighlight || undefined}
		data-testid="search-card"
		bind:this={articleElement}
	>
		<div class="card-image">
			<a
				href={resourceLink}
				aria-labelledby={titleId}
				aria-describedby={`${bodyId} ${footerId}`}
				tabindex="-1"
				onclick={passAlongAdjecentSearchResults}
			>
				<div class="pointer-events-none relative flex">
					{#if item.image}
						<img
							src={item.image.url}
							width={item.image.widthPx > 0 ? item.image.widthPx : undefined}
							height={item.image.heightPx > 0 ? item.image.heightPx : undefined}
							alt={page.data.t('general.instanceCover')}
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
								class={[
									'placeholder object-cover object-top',
									bookAspectRatio(item.typeForIcon) && 'aspect-3/4'
								]}
							/>
							<TypeIcon type={item.typeForIcon} class="absolute text-2xl text-neutral-400" />
						</div>
					{/if}
				</div>
			</a>
		</div>
		<div class="card-content grid">
			<header class="card-header" id={titleId}>
				<p class="card-header-top">
					<TypeIcon type={item.typeForIcon} class="text-2xs mb-0.25 inline" />
					{#if item.typeStr}
						<span class="font-medium">
							{item.typeStr}
						</span>
						<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
						<span class="divider">{' · '}</span>
					{/if}
					{#each item[LensType.WebCardHeaderTop]?._display as obj, index (index)}
						<span>
							<DecoratedData
								data={obj}
								showLabels={ShowLabelsOptions.Never}
								{allowLinks}
								{allowPopovers}
							/>
						</span>
					{/each}
				</p>
				<hgroup>
					<h2 class="card-header-title text-base font-medium">
						<a
							href={resourceLink}
							class="hover:text-link focus:text-link block hover:underline focus:underline"
							aria-describedby={`${bodyId} ${footerId}`}
							onclick={passAlongAdjecentSearchResults}
						>
							<DecoratedData
								data={item['card-heading']}
								showLabels={ShowLabelsOptions.Never}
								{allowLinks}
								{allowPopovers}
							/>
						</a>
					</h2>
				</hgroup>
				{#if item[LensType.WebCardHeaderExtra]?._display}
					<p class="card-header-extra">
						{#each item[LensType.WebCardHeaderExtra]?._display as obj, index (index)}
							<span>
								<DecoratedData
									data={obj}
									showLabels={ShowLabelsOptions.DefaultOn}
									{allowLinks}
									{allowPopovers}
								/>
							</span>
						{/each}
					</p>
				{/if}
			</header>
			{#if item[LxlLens.CardBody]?._display}
				<div class="card-body mt-1 text-xs" id={bodyId}>
					{#each item[LxlLens.CardBody]?._display as obj, index (index)}
						<div>
							<DecoratedData
								data={obj}
								showLabels={ShowLabelsOptions.DefaultOff}
								depth={2}
								block
								limit={{ contribution: 3, hasPart: 5, related: 5 }}
								allowLinks={true}
								{allowPopovers}
							/>
						</div>
					{/each}
				</div>
			{/if}
			<footer
				class="card-footer @container mt-1 flex flex-col-reverse flex-wrap md:flex-row"
				id={footerId}
			>
				{#if item.selectTypeStr}
					<span class="text-body font-medium">{item.selectTypeStr}</span>
					<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
					<span class="hidden whitespace-pre-wrap md:inline">{' · '}</span>
				{/if}
				<span>
					{#each item[LensType.WebCardFooter]?._display as obj, index (index)}
						{#if 'hasInstance' in obj}
							{@const instances = getInstanceData(obj.hasInstance)}
							{#if instances?.years}
								{#if instances.count > 1}
									{instances?.count}
									{page.data.t('search.editions')}
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
										<DecoratedData
											data={obj2}
											showLabels={ShowLabelsOptions.Never}
											{allowLinks}
											{allowPopovers}
										/>
									{/if}
								{/each}
							{/if}
						{:else}
							<span>
								<DecoratedData
									data={obj}
									showLabels={ShowLabelsOptions.Never}
									{allowLinks}
									{allowPopovers}
								/>
							</span>
						{/if}
					{/each}
				</span>
			</footer>
			{#if allowActions}
				<div class="card-actions flex gap-1 self-end pt-1">
					{#if isInstanceCard}
						<a
							class="btn btn-primary h-7 rounded-full md:h-8"
							href={getCiteLink(page.url, id)}
							onclick={(event) => handleClickCite(event, page.state, id)}
						>
							<BiQuote class="size-4 text-neutral-400" />
							<span>{page.data.t('citations.cite')}</span>
						</a>
					{/if}
					{#if isLibraryCard(item)}
						{@const userSettings = getUserSettings()}
						{@const alreadyAdded =
							userSettings.myLibraries &&
							Object.keys(userSettings.myLibraries).includes(item.libraryId)}
						<button
							class="btn btn-primary h-7 rounded-full md:h-8"
							type="button"
							onclick={() =>
								alreadyAdded
									? userSettings.removeLibrary(item.libraryId)
									: userSettings.addLibrary(item.libraryId, item.displayStr)}
						>
							{#if alreadyAdded}
								<BiHeartFill class="text-primary-600" />
								<span>{page.data.t('myPages.remove')}</span>
							{:else}
								<BiHeart class="text-primary-600" />
								<span>{page.data.t('myPages.add')}</span>
							{/if}
						</button>
					{/if}
					{@render holdingsButton()}
				</div>
			{/if}
		</div>

		{#if item._debug}
			{#key item._debug}
				<div class="card-debug z-20 self-start text-left select-text">
					<SearchItemDebug debugInfo={item._debug} />
					<button
						type="button"
						class="text-xs"
						onclick={() => {
							showDebugHaystack = !showDebugHaystack;
						}}
					>
						Haystack
					</button>
					<button
						type="button"
						class="text-xs"
						onclick={() => {
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
	</article>
</div>

<style lang="postcss">
	@reference 'tailwindcss';

	.card-header-extra {
		& :global(span[data-type='KeyTitle'] > span[data-property='rdf:type']) {
			display: none;
		}
	}

	.search-card {
		grid-template-areas:
			'image content'
			'debug .';
		grid-template-columns: 64px 1fr;

		@container card (min-width: 768px) {
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

		grid-template-areas:
			'header header'
			'body body'
			'footer footer'
			'actions actions';

		grid-template-columns: 1fr auto;

		@container card (min-width: 30rem) {
			grid-template-areas:
				'header header'
				'body actions'
				'footer actions';
		}
	}

	.card-debug {
		grid-area: extra;
	}

	.card-header {
		grid-area: header;
	}

	.card-body {
		grid-area: body;
	}

	.card-actions {
		grid-area: actions;
	}

	.card-footer {
		grid-area: footer;
		/* hide dangling divider · */
		& .divider {
			display: none;
		}
		& :global(.divider:has(+ span:not(.divider))) {
			display: inline;
		}
	}

	.card-header-top,
	.card-header-extra,
	.card-footer {
		font-size: var(--text-2xs);
		color: var(--color-subtle);
		font-weight: var(--font-weight-normal);
	}

	.card-header-top {
		/* hide dangling divider · */
		& .divider {
			display: none;
		}

		& :global(.divider:has(+ span:not(.divider))) {
			display: inline;
		}
	}

	.card-header {
			& :global(.transliteration) {
			font-size: var(--text-2xs);
			color: var(--color-subtle);
			font-weight: var(--font-weight-normal);
			display: block;
			}

			& :global(.transliteration._contentBefore),
			& :global(.transliteration._contentAfter) {
					display: none;
			}
	}

	/* TODO inline label style in DecoratedData */
	.card-header-extra,
	.card-body {
		& :global(div:has(> .property-label)) {
				/* override e.g isPartOf > hasTitle block */
				display: inline;
		}

		& :global(span[data-property]) {
				display: inline;
		}

		& :global(div[data-property] > div) {
				display: inline;
		}

		/* FIXME */
		& :global(div:has(> div[data-property='isPartOf'])),
		& :global(div[data-property='isPartOf']),
		& :global(div:has(> div[data-property='isPartOf']) + div:has(> div[data-property='part'])),
		& :global(div[data-property='part']) {
				display: inline;
		}

		& :global(div > div[data-property='part'])::before {
				content: ' ; ';
		}

		& :global(.property-label) {
				color: var(--color-body);
				font-style: italic;
		}

		& :global(.property-label):not(:empty)::after {
				color: var(--color-body);
				content: ': ';
		}
	}

	/* card in dialog */
	:global(dialog .search-card) {
		border-top: none;
		border-bottom: 1px solid var(--color-neutral);
		background-color: var(--color-page);
		border-radius: var(--radius-sm);

		& .card-actions {
			display: none;
		}
		/* todo: allow links? */
		& .card-image,
		.card-header-title {
			pointer-events: none;
		}
	}

	/* slim card in myLibraries search */
	:global(.my-libraries-result .search-card) {
		grid-template-columns: 48px 1fr;
		padding: calc(var(--spacing) * 2);

		& .card-header-title {
			font-size: var(--text-sm);
		}
	}

	/* card in popover */
	:global(.popover .search-card-container) {
		container-type: normal;

		& .search-card {
			padding: 0;
			column-gap: calc(var(--spacing) * 2);
			border: none;

			&:has(img.placeholder) {
				// hide placeholder in popover
				grid-template-areas:
				'content';
				grid-template-columns: 1fr;

				& .card-image {
					display: none;
				}
			}
		}

		& .card-header-title {
			pointer-events: none;
			font-size: var(--text-sm);
		}
	}
</style>
