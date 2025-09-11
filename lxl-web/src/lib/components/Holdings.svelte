<script lang="ts">
	import { page } from '$app/state';
	import type { BibIdObj, DecoratedHolder, ItemLinksByBibId } from '$lib/types/holdings';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import { BibDb } from '$lib/types/xl';
	import HoldingInfo from './HoldingInfo.svelte';
	import isFnurgel from '$lib/utils/isFnurgel';

	type HoldingsProps = {
		holder: DecoratedHolder;
		holdingUrl: string | null;
		linksByBibId: ItemLinksByBibId;
		bibIdsByInstanceId: Record<string, BibIdObj>;
	};

	const { holder, holdingUrl, linksByBibId, bibIdsByInstanceId }: HoldingsProps = $props();

	let instancesCollapsed = $state(true);

	// if holdingUrl is an instance fnurgel, add its mapped bibId object into arr,
	// else add all ids of current type with holdings for current sigel
	const bibIds = $derived.by(() => {
		if (holdingUrl && bibIdsByInstanceId?.[holdingUrl]) {
			return [bibIdsByInstanceId[holdingUrl]];
		} else if (holdingUrl && !isFnurgel(holdingUrl)) {
			// holdingUrl is type
			return Object.keys(bibIdsByInstanceId)
				.filter((i) => bibIdsByInstanceId[i]['@type'] === holdingUrl)
				.filter((i) => bibIdsByInstanceId[i].holders?.includes(holder.sigel))
				.map((i) => bibIdsByInstanceId[i]);
		} else {
			// holdingUrl is a workFnurgel
			return Object.keys(bibIdsByInstanceId)
				.filter((i) => bibIdsByInstanceId[i].holders?.includes(holder.sigel))
				.map((i) => bibIdsByInstanceId[i]);
		}
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

	function hasOpeningHoursEtc() {
		const id = bibIds.at(0);
		if (id) {
			const openingHours = linksByBibId[id.bibId]?.[holder.sigel]?.[BibDb.OpeningHours];
			const address = linksByBibId[id.bibId]?.[holder.sigel]?.[BibDb.Address];

			return openingHours || address?.join('').trim();
		}
		return false;
	}
</script>

<li class="border-neutral text-sm not-last:border-b">
	<h2 class="mt-4 mb-2 line-clamp-2 text-base font-medium">
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
			<button
				class="text-subtle link-subtle mb-2"
				onclick={() => (instancesCollapsed = !instancesCollapsed)}
			>
				{#if instancesCollapsed}
					{page.data.t('holdings.showAll')} ({bibIds.length})
				{:else}
					{page.data.t('holdings.showFewer')}
				{/if}
			</button>
		{/if}
		<ul>
			{#if bibIds[0] && missingAtLeastOneLinkToItem()}
				{@const firstBibId = bibIds[0]?.bibId}
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
	{#if hasOpeningHoursEtc()}
		<details>
			<summary class="my-3 flex cursor-pointer items-baseline gap-0.5">
				<span class="text-3xs arrow text-subtle h-3 origin-center rotate-0 transition-transform">
					<BiChevronRight />
				</span>
				{page.data.t('holdings.openingHoursEtc')}
			</summary>
			<div class="border-neutral bg-page my-3 max-w-md rounded-sm border p-2">
				<span>
					{#if bibIds.at(0)}
						{@const firstBibId = bibIds[0]?.bibId}
						<ul style="white-space: pre-line" class="text-xs">
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
	{/if}
</li>

<style lang="postcss">
	li {
		margin-bottom: calc(var(--spacing) * 2);
	}

	.bib-list li {
		display: list-item;
	}

	.bib-list.instancesCollapsed li:nth-child(n + 6) {
		display: none;
	}

	details[open] {
		& .arrow {
			rotate: 90deg;
		}
	}
</style>
