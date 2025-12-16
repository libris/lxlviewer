<script lang="ts">
	import { page } from '$app/state';
	import TableOfContents, { type TableOfContentsItem } from './TableOfContents.svelte';
	import { type SecureImage, Width as ImageWidth } from '$lib/types/auxd';
	import { JsonLd } from '$lib/types/xl';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import type { HoldingsData } from '$lib/types/holdings';
	import type { ResourceData } from '$lib/types/resourceData';
	import type {
		SearchResultItem,
		AdjecentSearchResult,
		ResourceSearchResult
	} from '$lib/types/search';
	import capitalize from '$lib/utils/capitalize';
	import type { Relation } from '$lib/utils/relations';
	import DecoratedData from './DecoratedData.svelte';
	import ResourceImage from './ResourceImage.svelte';
	import ResourceHoldings from './ResourceHoldings.svelte';
	import SearchResultList from './SearchResultList.svelte';
	import AdjecentResults from './resource/AdjecentResults.svelte';
	import TypeIcon from '$lib/components/TypeIcon.svelte';
	import SearchCard from './find/SearchCard.svelte';
	import TabList, { type Tab } from './TabList.svelte';
	import SearchMapping from './find/SearchMapping.svelte';
	import IconArrowRight from '~icons/bi/arrow-right-short';
	import IconArrowDown from '~icons/bi/arrow-down';
	import Carousel from '$lib/components/Carousel.svelte';

	type Props = {
		fnurgel: string;
		uid?: string;
		typeForIcon: string;
		images: SecureImage[];
		decoratedData: {
			headingTop: DecoratedData;
			heading: DecoratedData;
			headingExtra: DecoratedData;
			overview: DecoratedData[];
			overview2: DecoratedData;
			overviewFooter: DecoratedData;
			summary: DecoratedData[];
			resourceTableOfContents: DecoratedData[];
			details: DecoratedData[];
		};
		relations: Relation[];
		relationsPreviewsByQualifierKey: Record<string, SearchResultItem[]>;
		instances: SearchResultItem[] | ResourceData[]; // TODO: fix better types
		searchResult?: ResourceSearchResult;
		holdings: HoldingsData;
		tableOfContents: TableOfContentsItem[];
		adjecentSearchResults?: AdjecentSearchResult[];
	};

	const {
		fnurgel,
		uid,
		typeForIcon,
		images,
		decoratedData,
		relations,
		relationsPreviewsByQualifierKey,
		instances,
		searchResult,
		holdings,
		tableOfContents,
		adjecentSearchResults
	}: Props = $props();

	const uidPrefix = $derived(uid ? `${uid}-` : ''); // used for prefixing id's when resource is rendered inside panes

	let searchMapping = $derived(searchResult?.mapping);
	let filteredInstances = $derived(searchResult?.items);

	const derivedFilteredInstances = $derived.by(() => {
		const idSet = new Set(filteredInstances);
		return instances?.filter((instance) => idSet.has(instance?.[JsonLd.ID]));
	});

	const tabMatchingInstances: Tab | null = $derived.by(() => {
		if (filteredInstances?.length) {
			return {
				id: 'matching-instances',
				label: `${page.data.t('resource.matching')} (${filteredInstances?.length})`,
				content: panelMatchingInstances
			};
		}
		return null;
	});

	const tabAllInstances: Tab | null = $derived.by(() => {
		if (!filteredInstances || instances?.length > filteredInstances?.length) {
			return {
				id: 'all-instances',
				label: `${capitalize(page.data.t('resource.all'))} (${instances?.length})`,
				content: panelAllInstances
			};
		}
		return null;
	});

	const instanceTabs = $derived([tabMatchingInstances, tabAllInstances].filter((f) => !!f));
	const showTabs = $derived(
		derivedFilteredInstances?.length && derivedFilteredInstances?.length !== instances?.length
	);
</script>

{#snippet panelMatchingInstances()}
	{#if searchMapping}
		<div class="py-4">
			<SearchMapping mapping={searchMapping} />
		</div>
	{/if}
	{#each derivedFilteredInstances as instance (instance?.[JsonLd.ID])}
		<SearchCard item={instance as SearchResultItem} />
	{/each}
{/snippet}

{#snippet panelAllInstances()}
	{#each instances as instance (instance?.[JsonLd.ID])}
		<SearchCard item={instance as SearchResultItem} />
	{/each}
{/snippet}

{#snippet summaryOrToc(d)}
	<div class="summary-or-toc min-h-56 w-full">
		<DecoratedData data={d} showLabels={ShowLabelsOptions.Never} block />
	</div>
{/snippet}

{#if adjecentSearchResults}
	<div class="border-b-neutral @container border-b">
		<AdjecentResults {fnurgel} {adjecentSearchResults} />
	</div>
{/if}
<article class="@container @3xl:[&_[id]]:scroll-mt-36">
	{#if tableOfContents.length}
		<section data-testid="toc-mobile" class="contents @7xl:hidden">
			<TableOfContents items={tableOfContents} {uidPrefix} mobile />
		</section>
	{/if}
	<div
		class="max-w-10xl wide:max-w-screen mx-auto flex flex-col gap-3 px-3 @sm:gap-6 @sm:px-6 @3xl:grid @3xl:grid-cols-(--two-grid-cols) @3xl:gap-9 @7xl:grid-cols-(--three-grid-cols) @7xl:px-12"
	>
		{#if tableOfContents.length}
			<div class="order-last hidden @7xl:block">
				<section data-testid="toc" class="sticky py-3 @sm:py-6">
					<TableOfContents items={tableOfContents} />
				</section>
			</div>
		{/if}
		<div>
			<div class="sticky mx-auto pt-3 @sm:pt-6 @3xl:max-w-xs @3xl:pb-6">
				<ResourceImage
					{images}
					type={typeForIcon}
					alt={page.data.t('general.instanceCover')}
					thumbnailTargetWidth={ImageWidth.MEDIUM}
					linkToFull
				/>
				{#if holdings.byType && Object.keys(holdings.byType).length && instances}
					<section class="mt-5">
						<h2 class="sr-only">{page.data.t('holdings.availabilityByType')}</h2>
						<ResourceHoldings {holdings} {instances} {fnurgel} />
					</section>
				{/if}
			</div>
		</div>
		<div class="wide:max-w-screen mx-auto flex w-full max-w-4xl flex-col gap-3 @sm:gap-6 @3xl:py-6">
			<section id="{uidPrefix}top">
				<div class="flex flex-col-reverse gap-2 md:flex-row md:items-start">
					<header class="my-3 flex-1">
						<hgroup>
							<p class="text-subtle flex items-center gap-1 text-xs font-medium">
								<TypeIcon type={typeForIcon} class="mr-0.5 inline text-sm" />
								<DecoratedData
									data={decoratedData.headingTop}
									showLabels={ShowLabelsOptions.Never}
								/>
							</p>
							<h1 class="decorated-heading mt-2 mb-1 text-3xl font-medium @3xl:text-3xl">
								<DecoratedData data={decoratedData.heading} showLabels={ShowLabelsOptions.Never} />
							</h1>
							<p class="text-subtle flex items-center gap-1 text-xs font-medium">
								<DecoratedData
									data={decoratedData.headingExtra}
									showLabels={ShowLabelsOptions.DefaultOn}
								/>
							</p>
						</hgroup>
					</header>
				</div>
				<div class="decorated-overview-compact">
					{#each decoratedData.overview as overview (overview)}
						<div class="compact mb-2">
							<DecoratedData
								data={overview}
								showLabels={ShowLabelsOptions.DefaultOff}
								block
								limit={{ contribution: 10, hasVariant: 10 }}
							/>
						</div>
					{/each}
				</div>
				<div class="decorated-overview">
					<DecoratedData
						data={decoratedData.overview2}
						showLabels={ShowLabelsOptions.DefaultOn}
						block
						limit={{ contribution: 10, hasVariant: 10 }}
					/>
					<DecoratedData
						data={decoratedData.overviewFooter}
						block
						limit={{ contribution: 10, hasVariant: 10, hasPart: 10 }}
					/>
					<a
						class="btn btn-primary my-2 h-7 w-fit rounded-full md:h-8"
						href="#{uidPrefix}details"
						data-sveltekit-preload-data="false"
						data-testid="details-link"
					>
						<IconArrowDown />
						{page.data.t('resource.moreDetails')}
					</a>
				</div>
			</section>
			{#if decoratedData.summary.length}
				<section class="mt-6">
					<h2 id={`${uidPrefix}summary`} class="mb-6 text-xl font-medium">
						{page.data.t('resource.summary')}
					</h2>
					<Carousel items={decoratedData.summary} render={summaryOrToc} />
				</section>
			{/if}
			<section>
				{#if instances?.length > 1}
					<h2 id="{uidPrefix}editions" class="mb-4 text-xl font-medium">
						{page.data.t('resource.editions')}
					</h2>
					{#if showTabs}
						<TabList ariaLabel={page.data.t('resource.editions')} tabs={instanceTabs} />
					{:else}
						{@render panelAllInstances()}
					{/if}
				{/if}
			</section>
			{#if relations.length}
				<section class="mt-6">
					<h2 id={`${uidPrefix}occurrences`} class="mb-6 text-xl font-medium">
						{page.data.t('resource.occurrences')}
					</h2>
					<ul>
						{#each relations as relationItem (relationItem.qualifierKey)}
							<li id="{uidPrefix}occurrences-{relationItem.qualifierKey}" class="mb-12">
								<div class="border-b-neutral mb-6 flex place-content-between border-b pb-3">
									<h3 class="font-medium">
										<a
											href={page.data.localizeHref(relationItem.findUrl)}
											class="hover:underline focus:underline"
											tabindex={-1}
										>
											{relationItem.label}
										</a>
									</h3>
									<a
										href={page.data.localizeHref(relationItem.findUrl)}
										class="flex items-center text-sm font-medium hover:underline focus:underline"
									>
										<IconArrowRight class="inline size-5 text-neutral-500" />
										<span>
											{page.data.t('resource.show')}
											{#if relationItem.totalItems > 10}
												{page.data.t('resource.all')}
											{/if}
											{relationItem.totalItems.toLocaleString()}
											{#if relationItem.totalItems === 1}
												{page.data.t('resource.result')}
											{:else}
												{page.data.t('resource.results')}
											{/if}
										</span>
									</a>
								</div>
								<div class="-mx-3 @sm:-mx-6 @3xl:mx-0">
									<SearchResultList
										type="horizontal"
										items={relationsPreviewsByQualifierKey[relationItem.qualifierKey]}
									/>
								</div>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
			{#if decoratedData.resourceTableOfContents.length}
				<section class="mt-6">
					<h2 id={`${uidPrefix}resourceTableOfContents`} class="mb-6 text-xl font-medium">
						{page.data.t('resource.tableOfContents')}
					</h2>
					<Carousel items={decoratedData.resourceTableOfContents} render={summaryOrToc} />
				</section>
			{/if}
			<section>
				<h2 id="{uidPrefix}details" class="mb-4 text-xl font-medium">
					{page.data.t('resource.details')}
				</h2>
				<div class="decorated-overview">
					{#each decoratedData.details as details (details)}
						<div class="mb-2">
							<DecoratedData
								data={details}
								showLabels={ShowLabelsOptions.Always}
								block
								limit={{ contribution: 10, hasVariant: 10 }}
							/>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</article>

<style lang="postcss">
	@reference 'tailwindcss';

	.sticky {
		top: calc(var(--app-bar-height, 0) + var(--banner-height, 0));
	}

	.summary-or-toc {
		& :global(.provisionActivity) {
			font-style: italic;
		}
		& :global(.summary) {
			display: inline-block;
			max-width: 60ch;
			//text-align: justify;
		}
	}

	.decorated-heading {
		& :global(.transliteration) {
			font-size: var(--text-2xl);
			color: var(--color-subtle);
		}

		& :global(.agent-lifespan) {
			font-weight: var(--font-weight-normal);
			color: var(--color-subtle);
		}
	}

	.decorated-overview-compact {
		& :global(div:has(> .property-label)) {
			display: inline;
		}

		& :global(.property-label) {
			color: var(--color-body);
		}

		& :global(.property-label):not(:empty)::after {
			color: var(--color-body);
			content: ': ';
		}

		& :global(.contribution) {
			font-size: var(--text-lg);
			@apply mb-2;
		}

		& :global(.contribution-role) {
			font-size: var(--text-2xs);
			color: var(--color-subtle);
		}

		& :global(small) {
			display: block;
			&::first-letter {
				text-transform: capitalize;
			}
		}

		& :global(div[data-property]:not(:last-child)) {
			margin-bottom: 0;

			@variant sm {
				margin-bottom: 0;
			}
		}

		& :global(.inScheme) {
			font-size: var(--text-2xs);
			color: var(--color-subtle);
		}

		& :global(.contribution > ._contentBefore),
		:global(.contribution > ._contentAfter) {
			display: none;
		}

		& :global(.contribution > *) {
			display: block;
		}

		& :global(.provisionActivity > ._contentBefore),
		:global(.provisionActivity > ._contentAfter) {
			display: none;
		}

		/*
        & :global(.provisionActivity > span) {
           display: block;
        }

         */

		& :global(.see-also > *) {
			display: block;
			width: fit-content;
			white-space: nowrap;
		}

		& :global(.genre-form) {
			@apply py-3;
		}
	}

	.decorated-overview {
		& :global(.property-label) {
			font-size: var(--text-2xs);
		}

		& :global(.contribution) {
			font-size: var(--text-lg);
			@apply mb-2;
		}

		& :global(.contribution-role) {
			font-size: var(--text-2xs);
			color: var(--color-subtle);
		}

		& :global(small) {
			display: block;
			&::first-letter {
				text-transform: capitalize;
			}
		}

		& :global(div[data-property]:not(:last-child)) {
			margin-bottom: calc(var(--spacing) * 1.5);

			@variant sm {
				margin-bottom: calc(var(--spacing) * 3);
			}
		}

		& :global(.inScheme) {
			font-size: var(--text-2xs);
			color: var(--color-subtle);
		}

		& :global(.provisionActivity > ._contentBefore),
		:global(.provisionActivity > ._contentAfter) {
			display: none;
		}

		& :global(.provisionActivity > *) {
			display: block;
		}

		& :global(.see-also > *) {
			display: block;
			width: fit-content;
			white-space: nowrap;
		}
	}

	:global([role='tabpanel'] .\@container\/card:first-of-type .search-card) {
		border-top: none;
	}
</style>
