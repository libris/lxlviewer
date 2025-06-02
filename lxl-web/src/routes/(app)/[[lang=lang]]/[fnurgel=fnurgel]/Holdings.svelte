<script lang="ts">
	import { page } from '$app/state';
	import type { DecoratedHolder, ItemLinksByBibId } from '$lib/types/holdings';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import { BibDb } from '$lib/types/xl';
	import HoldingInfo from './HoldingInfo.svelte';

	type HoldingsProps = {
		holder: DecoratedHolder;
		holdingUrl: string;
		linksByBibId: ItemLinksByBibId;
	};

	const { holder, holdingUrl, linksByBibId }: HoldingsProps = $props();

	const sigel = holder?.sigel;
	let instancesCollapsed = $state(true);

	// if holdingUrl is an instance fnurgel, add its mapped bibId object into arr,
	// else add all ids of current type with holdings for current sigel
	const bibIds = $derived.by(() => {
		return page.data.bibIdsByInstanceId?.[holdingUrl]
			? [page.data.bibIdsByInstanceId[holdingUrl]]
			: Object.keys(page.data.bibIdsByInstanceId)
					.filter((i) => page.data.bibIdsByInstanceId[i]['@type'] === holdingUrl)
					.filter((i) => page.data.bibIdsByInstanceId[i].holders?.includes(sigel))
					.map((i) => page.data.bibIdsByInstanceId[i]);
	});

	function hasLinksToItem(id: string) {
		return linksByBibId[id]?.[holder.sigel]?.[BibDb.LinksToItem];
	}

	function hasLoanReserveLink(id: string) {
		return linksByBibId[id]?.[holder.sigel]?.[BibDb.LoanReserveLink];
	}

	function missingAtLeastOneLinkToItem() {
		return bibIds.find((id) => !hasLinksToItem(id.bibId) && !hasLoanReserveLink(id.bibId));
	}
</script>

<li class="border-neutral text-sm not-last:border-b">
	<h2 class="holder-label mt-4 line-clamp-1">
		<DecoratedData data={holder.obj} showLabels={ShowLabelsOptions['Never']} />
	</h2>
	<div class="">
		<ul class="bib-list" class:instancesCollapsed>
			{#each bibIds as id (id.bibId)}
				{#if linksByBibId[id.bibId]?.[holder.sigel]}
					<li>
						<HoldingInfo {id} {holder} {linksByBibId} isSingle={bibIds.length > 1}></HoldingInfo>
					</li>
				{/if}
			{/each}
		</ul>
		{#if bibIds.length > 5}
			<button class="show-all mb-2" onclick={() => (instancesCollapsed = !instancesCollapsed)}>
				{#if instancesCollapsed}
					{page.data.t('holdings.showAll')} ({bibIds.length})
				{:else}
					{page.data.t('holdings.showFewer')}
				{/if}
			</button>
		{/if}
		<ul>
			{#if bibIds.at(0) && missingAtLeastOneLinkToItem()}
				{@const firstBibId = bibIds.at(0).bibId}
				<li>
					{#if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.LinksToCatalog]}
						<a
							href={linksByBibId[firstBibId][holder.sigel][BibDb.LinksToCatalog].at(0)}
							target="_blank"
							class="ext-link"
						>
							{page.data.t('holdings.linkToCatalog')}
						</a>
					{:else if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.LinksToSite]}
						<a
							href={linksByBibId[firstBibId][holder.sigel][BibDb.LinksToSite].at(0)}
							target="_blank"
							class="ext-link"
						>
							{page.data.t('holdings.linkToSite')}
						</a>
					{/if}
				</li>
			{/if}
		</ul>
	</div>
	<details>
		<summary class="my-3 flex cursor-pointer items-baseline">
			<span
				class="text-3xs arrow text-subtle mr-0.5 h-3 origin-center rotate-0 transition-transform"
			>
				<BiChevronRight />
			</span>
			{page.data.t('holdings.openingHoursEtc')}
		</summary>
		<div class="status-container border-neutral bg-page my-3 max-w-md rounded-sm border p-2">
			<span>
				{#if bibIds.at(0)}
					{@const firstBibId = bibIds.at(0).bibId}
					<ul style="white-space: pre-line">
						{#if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.OpeningHours]}
							<li>
								{linksByBibId[firstBibId][holder.sigel][BibDb.OpeningHours].at(0)}
							</li>
						{/if}
						{#if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.Address]}
							{#each linksByBibId[firstBibId][holder.sigel][BibDb.Address] as address, index (index)}
								<li class="my-2">
									{address}
								</li>
							{/each}
						{/if}
					</ul>
				{/if}
			</span>
		</div>
	</details>
</li>

<style lang="postcss">
	@reference "../../../../app.css";

	h2 {
		@apply mb-2;
	}

	li {
		@apply mb-2;
	}

	.show-all {
		@apply text-subtle;
		text-decoration: underline;
		text-decoration-style: dotted;
	}

	.bib-list li {
		display: list-item;
	}
	.bib-list.instancesCollapsed li:nth-child(n + 6) {
		display: none;
	}

	details[open] {
		& .arrow {
			@apply rotate-90;
		}
	}

	.holder-label {
		@apply line-clamp-2 text-base font-medium;
	}

	.status-container {
		&:has(p.error) {
			background-color: var(--color-warning-100);
		}

		/* don't repeat the library-unavailable message for every instance */
		&:has(p.library-unavailable):not(:first-of-type) {
			display: none;
		}
	}

	table th {
		font-weight: var(--font-weight-medium);
		width: calc(var(--spacing) * 24);
		padding-right: calc(var(--spacing) * 4);
		vertical-align: baseline;
	}

	table td {
		width: auto;
	}
</style>
