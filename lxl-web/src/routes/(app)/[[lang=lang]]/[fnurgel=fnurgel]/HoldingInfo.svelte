<script lang="ts">
	import { page } from '$app/state';
	import type { DecoratedHolder, ItemLinksByBibId } from '$lib/types/holdings';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import { BibDb } from '$lib/types/xl';
	import HoldingAvailability from './HoldingAvailability.svelte';

	type HoldingInfoProps = {
		holder: DecoratedHolder;
		holdingUrl: string;
		linksByBibId: ItemLinksByBibId;
	};

	const { holder, holdingUrl, linksByBibId }: HoldingInfoProps = $props();

	const sigel = holder?.sigel;

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

	function hasStatusLink(id: string) {
		return linksByBibId[id][holder.sigel][BibDb.ItemStatus];
	}

	function hasInstanceContent(id: string) {
		return hasLoanReserveLink(id) || hasLinksToItem(id) || hasStatusLink(id);
	}
</script>

<li class="border-neutral text-xs not-last:border-b">
	<div class="holder-label mt-4">
		<DecoratedData data={holder.obj} showLabels={ShowLabelsOptions['Never']} />
	</div>
	<div class="ml-3">
		<div class="my-3">
			<ul>
				{#each bibIds as id (id.bibId)}
					{#if linksByBibId[id.bibId]?.[holder.sigel]}
						{@const linksForHolder = linksByBibId[id.bibId][holder.sigel]}
						{#if hasInstanceContent(id.bibId)}
							<div class="instance-token mt-4 mb-1">{id.str}</div>
							{#if hasStatusLink(id.bibId)}
								<HoldingAvailability {holder} bibId={id}></HoldingAvailability>
							{/if}
							<div class="mb-3">
								{#if hasLoanReserveLink(id.bibId)}
									<li>
										<a
											href={linksForHolder['loanReserveLink'].at(0)}
											target="_blank"
											class="btn btn-outlined ext-link h-9 max-w-sm"
										>
											{page.data.t('holdings.loanReserveLink')}
										</a>
									</li>
								{:else if hasLinksToItem(id.bibId)}
									<li>
										<a
											href={linksForHolder[BibDb.LinksToItem].at(0)}
											target="_blank"
											class="btn btn-outlined ext-link h-9 max-w-sm"
										>
											{page.data.t('holdings.linkToLocal')}
										</a>
									</li>
								{/if}
							</div>
						{/if}
					{/if}
				{/each}
				{#if bibIds.at(0) && missingAtLeastOneLinkToItem()}
					{@const firstBibId = bibIds.at(0).bibId}
					<div class="mt-2">
						{#if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.LinksToCatalog]}
							<li>
								<a
									href={linksByBibId[firstBibId][holder.sigel][BibDb.LinksToCatalog].at(0)}
									target="_blank"
									class="ext-link"
								>
									{page.data.t('holdings.linkToCatalog')}
								</a>
							</li>
						{:else if linksByBibId[firstBibId]?.[holder.sigel]?.[BibDb.LinksToSite]}
							<li>
								<a
									href={linksByBibId[firstBibId][holder.sigel][BibDb.LinksToSite].at(0)}
									target="_blank"
									class="ext-link"
								>
									{page.data.t('holdings.linkToSite')}
								</a>
							</li>
						{/if}
					</div>
				{/if}
			</ul>
		</div>
		<details>
			<summary class="my-4 flex cursor-pointer items-baseline">
				<span class="arrow text-subtle mr-2 h-3 origin-center rotate-0 transition-transform">
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
	</div>
</li>

<style lang="postcss">
	@reference "../../../../app.css";

	details[open] {
		& .arrow {
			@apply rotate-90;
		}

		& .holder-label {
			white-space: normal;
		}
	}

	.holder-label {
		@apply flex-1 overflow-hidden text-ellipsis whitespace-nowrap;
		font-weight: bold;
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

	.instance-token {
		color: var(--color-subtle);
	}

	.indicator {
		@apply mb-0.5 inline-block h-2.5 w-2.5 rounded-full align-middle;

		&.unavailable {
			background-color: var(--color-severe-500);
		}
		&.available {
			background-color: var(--color-success);
		}
	}
</style>
