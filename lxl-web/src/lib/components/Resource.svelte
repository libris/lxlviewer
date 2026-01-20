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
	import BiDownload from '~icons/bi/download';
	import ExpandableArea from '$lib/components/ExpandableArea.svelte';

	type Props = {
		fnurgel: string;
		uri: string;
		recordUri: string;
		controlNumber: string;
		uid?: string;
		typeForIcon: string;
		images: SecureImage[];
		decoratedData: {
			headingTop: DecoratedData;
			heading: DecoratedData;
			headingExtra: DecoratedData;
			overview: DecoratedData[];
			overview2: DecoratedData[];
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
		uri,
		recordUri,
		controlNumber,
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
					<header class="mb-3 flex-1">
						<hgroup>
							<p class="text-subtle flex items-center gap-1 text-sm font-medium">
								<TypeIcon type={typeForIcon} class="mr-0.5 inline text-sm" />
								<DecoratedData
									data={decoratedData.headingTop}
									showLabels={ShowLabelsOptions.Never}
								/>
							</p>
							<h1 class="decorated-heading mt-2 mb-1 text-3xl font-medium @3xl:text-3xl">
								<DecoratedData data={decoratedData.heading} showLabels={ShowLabelsOptions.Never} />
							</h1>
							<p
								class="decorated-heading-extra text-subtle flex items-center gap-1 text-sm font-medium"
							>
								<DecoratedData
									data={decoratedData.headingExtra}
									showLabels={ShowLabelsOptions.DefaultOn}
								/>
							</p>
						</hgroup>
					</header>
				</div>
				<div class="decorated-data-section decorated-compact">
					{#each decoratedData.overview as overview (overview)}
						<div class="compact mb-2">
							<DecoratedData
								data={overview}
								showLabels={ShowLabelsOptions.DefaultOff}
								block
								limit={{ contribution: 5, hasVariant: 10 }}
							/>
						</div>
					{/each}
				</div>
				<div class="decorated-data-section decorated-spacious">
					{#if decoratedData.overview.some((o) => o._display?.length > 0) && decoratedData.overview2.some((o) => o._display?.length > 0)}
						<div class="border-b-neutral mb-2 border-b"></div>
					{/if}
					{#each decoratedData.overview2 as overview2 (overview2)}
						<div class="compact mb-2">
							<DecoratedData
								data={overview2}
								showLabels={ShowLabelsOptions.DefaultOn}
								block
								limit={{ contribution: 5, hasVariant: 5 }}
							/>
						</div>
					{/each}
					<div class="mb-2">
						<DecoratedData
							data={decoratedData.overviewFooter}
							block
							limit={{ contribution: 5, hasVariant: 10, hasPart: 10 }}
						/>
					</div>
					{#if decoratedData.summary.length || instances?.length > 1 || relations.length || decoratedData.resourceTableOfContents.length}
						<a
							class="btn btn-primary my-2 h-7 w-fit rounded-full md:h-8"
							href="#{uidPrefix}details"
							data-sveltekit-preload-data="false"
							data-testid="details-link"
						>
							<IconArrowDown />
							{page.data.t('resource.moreDetails')}
						</a>
					{/if}
				</div>
			</section>
			{#if decoratedData.summary.length}
				<section>
					<h2 id={`${uidPrefix}summary`} class="mb-3 text-xl font-medium">
						{page.data.t('resource.summary')}
					</h2>
					{#snippet summary()}
						<div class="flex flex-col gap-6">
							{#each decoratedData.summary as s (s)}
								<p class="summary-or-toc w-full">
									<DecoratedData data={s} showLabels={ShowLabelsOptions.Never} block />
								</p>
							{/each}
						</div>
					{/snippet}

					<ExpandableArea content={summary} collapsedHeightPx={instances?.length > 1 ? 200 : 400} />
				</section>
			{/if}
			{#if instances?.length > 1}
				<section>
					<h2 id="{uidPrefix}editions" class="mb-4 text-xl font-medium">
						{page.data.t('resource.editions')}
					</h2>
					{#if showTabs}
						<TabList ariaLabel={page.data.t('resource.editions')} tabs={instanceTabs} />
					{:else}
						{@render panelAllInstances()}
					{/if}
				</section>
			{/if}
			{#if relations.length}
				<section>
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
				<section>
					<h2 id={`${uidPrefix}resourceTableOfContents`} class="mb-3 text-xl font-medium">
						{page.data.t('resource.tableOfContents')}
					</h2>
					{#snippet resourceTableOfContents()}
						<div class="flex flex-col gap-6">
							{#each decoratedData.resourceTableOfContents as r (r)}
								<p class="summary-or-toc w-full">
									<DecoratedData data={r} showLabels={ShowLabelsOptions.Never} block />
								</p>
							{/each}
						</div>
					{/snippet}

					<ExpandableArea content={resourceTableOfContents} collapsedHeightPx={300} />
				</section>
			{/if}
			<section class="-mx-6 my-6 bg-neutral-100 px-6 pb-6 @2xl:mx-0 @2xl:rounded-lg">
				<h2 id="{uidPrefix}details" class="my-4 text-xl font-medium">
					{page.data.t('resource.details')}
				</h2>
				<div class="decorated-data-section decorated-spacious decorated-details">
					{#each decoratedData.details as details (details)}
						<div class="mb-2">
							<DecoratedData
								data={details}
								showLabels={ShowLabelsOptions.Always}
								block
								limit={{ contribution: 5, hasVariant: 10 }}
							/>
						</div>
					{/each}
				</div>
				<div class="mt-5 text-sm">
					<p>
						{page.data.t('resource.uriLink')}: <a href={uri} class="link">{uri}</a>
					</p>
					<p>
						{page.data.t('resource.downloadDescription')}:
						<a href="{recordUri}/data.jsonld" target="_blank" class="ext-link">JSON-LD</a>
						· <a href="{recordUri}/data.ttl" target="_blank" class="ext-link">Turtle</a>
						· <a href="{recordUri}/data.rdf" target="_blank" class="ext-link">RDF/XML</a>
						{#if instances?.length === 1}
							· <a
								href="{recordUri
									.split('/')
									.toSpliced(-1, 1)
									.join('/')}/_compilemarc?library=Foo&id={recordUri}"
								target="_blank"
								download="{fnurgel}.marc"
								class="link">MARC21 (ISO 2709) <BiDownload class="inline" /></a
							>
							<!--
                            TODO _compilemarc can only create ISO 2709
                            TODO _compilemarc can only handle bib
                            TODO? select export profile (library)?
                            <a href="{fnurgel}" target="_blank" class="ext-link">MARC-XML</a> ·
                            -->
						{/if}
					</p>
					<p>
						<a
							href={recordUri.split('/').toSpliced(-1, 0, 'katalogisering').join('/')}
							target="_blank"
							class="ext-link"
							>{page.data.t('resource.showIn')} {page.data.t('resource.librisCataloging')}</a
						>
						{#if instances?.length === 1}
							· <a href="https://libris.kb.se/bib/{controlNumber}" target="_blank" class="ext-link"
								>{page.data.t('resource.showIn')} {page.data.t('resource.librisOld')}</a
							>
						{/if}
					</p>
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
			/*max-width: 60ch;*/
			text-align: justify;
		}

		& :global(div[data-property='tableOfContents'] > span[data-type='TableOfContents']) {
			display: block;
		}

		& :global(div[data-property='tableOfContents'] > span[data-type='TableOfContents'])::before {
			content: ' • ';
			color: var(--color-subtle);
		}

		& :global(div[data-property='tableOfContents'] > span._contentBefore) {
			display: none;
		}

		& :global(.provisionActivity:has(> span:nth-of-type(2)) .property-label) {
			display: block;
			/*font-size: var(--text-2xs);*/
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

	.decorated-heading-extra {
		& :global(span[data-type='KeyTitle'] > span[data-property='rdf:type']) {
			display: none;
		}
	}

	.decorated-data-section {
		& :global(small) {
			display: block;
			&::first-letter {
				text-transform: capitalize;
			}
		}

		& :global(.contribution) {
			font-size: var(--text-lg);
			@apply mb-2;
			@apply mt-1;
		}

		& :global(.contribution-role) {
			font-size: var(--text-2xs);
			color: var(--color-subtle);
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

		& :global(div[data-property='identifiedBy'] > ._contentBefore) {
			display: none;
		}

		& :global(div[data-property='identifiedBy'] > span) {
			display: block;
		}

		& :global(.see-also > *) {
			display: block;
			width: fit-content;
			white-space: nowrap;
		}

		& :global(.hasNote > *) {
			display: block;
		}

		& :global(.hasNote > span)::before {
			content: ' • ';
			color: var(--color-subtle);
		}

		& :global(.hasNote > ._contentBefore),
		:global(.hasNote > ._contentAfter) {
			display: none;
		}

		& :global(div[data-property='hasTitle'] > span) {
			display: block;
		}

		& :global(div[data-property='hasTitle'] > ._contentBefore),
		:global(div[data-property='hasTitle'] > ._contentAfter) {
			display: none;
		}

		/* hide double dash - */
		& :global(._contentAfter.startYear + ._contentBefore.endYear) {
			display: none;
		}

		& :global(.see-also > *) {
			display: block;
			width: fit-content;
			white-space: nowrap;
		}

		& :global(.genre-form) {
			@apply py-3;
		}

		& :global(.coverage) {
			color: var(--color-subtle);
		}

		& :global(.provisionActivity:has(> span:nth-of-type(2)) .property-label) {
			display: block;
			/*font-size: var(--text-2xs);*/
		}

		& :global(.provisionActivity:has(> span:nth-of-type(2))) {
			@apply py-1;

			& :global(> ._contentBefore),
			:global(> ._contentAfter) {
				display: none;
			}

			& :global(> span) {
				display: block;
			}

			& :global(span[data-type='PrimaryPublication']) {
			}

			& :global(span[data-type='Publication']) {
				/* color: var(--color-subtle); */
				/* font-weight: var(--font-weight-light); */
			}
		}

		& :global(span.Title-type) {
			font-size: var(--text-2xs);
			color: var(--color-subtle);
		}

		& :global(span.Title-type)::before {
			content: ' ';
		}

		& :global(.coverage + span.Title-type) {
			display: none;
		}

		& :global(span[data-property='typeNote']) {
			color: var(--color-subtle);
		}
	}

	.decorated-compact {
		& :global(div:has(> .property-label)) {
			/* override e.g isPartOf > hasTitle block */
			display: inline;
		}

		& :global(span[data-property]) {
			display: inline;
		}

		& :global(div[data-property='isPartOf']:has(+ div[data-property='part'])) {
			display: inline;
		}
		& :global(div[data-property='isPartOf'] + div[data-property='part']) {
			display: inline;
		}
		& :global(div[data-property='isPartOf'] + div[data-property='part'])::before {
			content: ' ; ';
		}

		& :global(div[data-property='hasPart']) {
			@apply pb-2;

			& :global(.contribution > span) {
				display: inline;
			}

			& :global(> span) {
				display: block;
			}

			& :global(> span)::before {
				content: ' • ';
				color: var(--color-subtle);
			}

			& :global(.contribution) {
				font-size: var(--text-md);
				@apply mb-0;
				@apply mt-0;
			}
		}

		& :global(.property-label) {
			color: var(--color-body);
			font-style: italic;
		}

		& :global(.property-label):not(:empty)::after {
			color: var(--color-body);
			content: ': ';
		}

		& :global(div[data-property]:not(:last-child)) {
			margin-bottom: 0;

			@variant sm {
				margin-bottom: 0;
			}
		}
	}

	.decorated-spacious {
		& :global(.property-label) {
			font-size: var(--text-2xs);
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
	}

	.decorated-details {
		& :global(div[data-property='hasTitle'] > span[data-type='Title']) {
			/* color: var(--color-subtle); */
			font-weight: var(--font-weight-semibold);
		}
	}

	:global([role='tabpanel'] .\@container\/card:first-of-type .search-card) {
		border-top: none;
	}
</style>
