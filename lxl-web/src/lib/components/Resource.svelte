<script lang="ts">
	import { page } from '$app/state';
	import TableOfContents, { type TableOfContentsItem } from './TableOfContents.svelte';
	import DecoratedData from './DecoratedData.svelte';
	import ResourceImage from './ResourceImage.svelte';
	import ResourceHoldings from './ResourceHoldings.svelte';
	import InstancesList from '../../routes/(app)/[[lang=lang]]/[fnurgel=fnurgel]/InstancesList.svelte';
	import HoldingsModal from '../../routes/(app)/[[lang=lang]]/[fnurgel=fnurgel]/HoldingsModal.svelte';
	import { type SecureImage, Width as ImageWidth } from '$lib/types/auxd';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import IconArrowRight from '~icons/bi/arrow-right-short';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import type { HoldersByType } from '$lib/types/holdings';
	import type { Relation } from '$lib/utils/relations';
	import type { SearchResultItem, AdjecentSearchResult } from '$lib/types/search';
	import SearchResultList from './SearchResultList.svelte';
	import AdjecentResults from './resource/AdjecentResults.svelte';

	type Props = {
		fnurgel: string;
		uid?: string;
		type?: string;
		images: SecureImage[];
		decoratedTypes: DecoratedData;
		decoratedHeading: DecoratedData;
		decoratedOverview: DecoratedData;
		relations: Relation[];
		relationsPreviewsByQualifierKey: Record<string, SearchResultItem[]>;
		instances: Record<string, unknown>[]; // TODO: fix better types
		holdersByType: HoldersByType;
		tableOfContents: TableOfContentsItem[];
		adjecentSearchResults?: AdjecentSearchResult[];
	};

	const {
		fnurgel,
		uid,
		type,
		images,
		decoratedTypes,
		decoratedHeading,
		decoratedOverview,
		relations,
		relationsPreviewsByQualifierKey,
		instances,
		holdersByType,
		tableOfContents,
		adjecentSearchResults
	}: Props = $props();

	const uidPrefix = $derived(uid ? `${uid}-` : ''); // used for prefixing id's when resource is rendered inside panes

	let TypeIcon = $derived(type ? getTypeIcon(type) : undefined);
</script>

{#if adjecentSearchResults}
	<div class="border-b-neutral @container border-b">
		<AdjecentResults {fnurgel} {adjecentSearchResults} />
	</div>
{/if}
<article class="@container [&_[id]]:scroll-mt-3 sm:[&_[id]]:scroll-mt-6">
	{#if tableOfContents.length}
		<section data-testid="toc-mobile" class="contents @7xl:hidden">
			<TableOfContents items={tableOfContents} {uidPrefix} mobile />
		</section>
	{/if}
	<div
		class="max-w-10xl wide:max-w-screen mx-auto flex flex-col gap-3 p-3 sm:gap-6 sm:p-6 @3xl:grid @3xl:grid-cols-(--two-grid-cols) @3xl:gap-9 @7xl:grid-cols-(--three-grid-cols) @7xl:px-12"
	>
		{#if tableOfContents.length}
			<div class="order-last hidden @7xl:block">
				<section data-testid="toc" class="sticky top-6">
					<TableOfContents items={tableOfContents} />
				</section>
			</div>
		{/if}
		<div>
			<div class="sticky top-6 mx-auto @3xl:max-w-xs">
				<ResourceImage
					{images}
					{type}
					alt={page.data.t('general.latestInstanceCover')}
					thumbnailTargetWidth={ImageWidth.MEDIUM}
					linkToFull
				/>
				{#if holdersByType && Object.keys(holdersByType).length && instances}
					<section class="mt-5">
						<h2 class="sr-only">{page.data.t('holdings.availabilityByType')}</h2>
						<ResourceHoldings {holdersByType} {instances} />
					</section>
				{/if}
			</div>
		</div>
		<div class="wide:max-w-screen mx-auto flex w-full max-w-4xl flex-col gap-3 sm:gap-6">
			<section id="{uidPrefix}top">
				<header>
					<hgroup>
						<p class="text-subtle text-xs font-medium">
							{#if TypeIcon}
								<TypeIcon class="mr-0.5 inline text-sm" />
							{/if}
							<DecoratedData data={decoratedTypes} showLabels={ShowLabelsOptions.Never} />
						</p>
						<h1 class="decorated-heading my-3 text-3xl font-medium @3xl:text-3xl">
							<DecoratedData data={decoratedHeading} showLabels={ShowLabelsOptions.Never} />
						</h1>
					</hgroup>
				</header>
				<div class="decorated-overview">
					<DecoratedData data={decoratedOverview} block />
				</div>
			</section>
			<section>
				<div class="decorated-overview">
					<InstancesList
						data={instances}
						columns={[
							{
								header: page.data.t('search.publicationYear'),
								data: '*[].publication[].*[][?year].year'
							},
							{
								header: page.data.t('search.publisher'),
								data: '*[].publication.*[][?agent].agent'
							},
							{ header: page.data.t('search.type'), data: '_label' }
						]}
					/>
				</div>
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
											{relationItem.totalItems}
											{#if relationItem.totalItems === 1}
												{page.data.t('resource.result')}
											{:else}
												{page.data.t('resource.results')}
											{/if}
										</span>
									</a>
								</div>
								<div class="-mx-3 sm:-mx-6 @3xl:mx-0">
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
		</div>
	</div>
</article>
<HoldingsModal workFnurgel={fnurgel} />

<style lang="postcss">
	@reference 'tailwindcss';

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

	.decorated-overview {
		& :global(.property-label) {
			font-size: var(--text-2xs);
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

		& :global(.contribution > ._contentBefore),
		:global(.contribution > ._contentAfter) {
			display: none;
		}

		& :global(.contribution > *) {
			display: block;
		}

		& :global(.see-also > *) {
			display: block;
			width: fit-content;
			white-space: nowrap;
		}
	}
</style>
