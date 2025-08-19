<script lang="ts">
	import jmespath from 'jmespath';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	import type { ResourceData } from '$lib/types/resourceData';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { getResourceId } from '$lib/utils/resourceData';
	import { relativizeUrl } from '$lib/utils/http';
	import { getHoldingsLink, getMyLibsFromHoldings, handleClickHoldings } from '$lib/utils/holdings';

	import InstancesListContent from './InstancesListContent.svelte';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import MyLibrariesIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';

	/**
	 * TODO:
	 * - [] Replace jmespath (used for queriyng data for the columns) with something more home-baked (with smaller bundle-size). Another alternative could be querying and preparing the column data server-side?
	 * - [] Add tests (e.g. rows should be expandable and permalink should work, and that opened state should be saved when navigating forward and backwards). The tests should probably be placed inside +page.svelte...
	 */
	type InstancesListProps = {
		uidPrefix?: string;
		data: ResourceData;
		columns: { header: string; data: string }[];
	};
	const { uidPrefix, data, columns }: InstancesListProps = $props();

	let instancesList: HTMLUListElement | undefined = $state();
	let userSettings = getUserSettings();

	function handleToggleDetails(state: { expandedInstances?: string[] }) {
		let openIds: string[] = [];
		instancesList?.querySelectorAll('details[open]').forEach((openElement) => {
			const parentId = openElement.parentElement?.id;
			if (parentId) {
				openIds = [...openIds, parentId];
			}
		});

		// Only replace state if opened details elements have changed since last toggle event
		if (
			!state.expandedInstances?.every((value) => openIds.includes(value)) ||
			!openIds?.every((value) => state.expandedInstances?.includes(value))
		) {
			replaceState(window.location.href, {
				...state,
				expandedInstances: openIds
			});
		}
	}

	function getCollapseAllUrl(url: URL) {
		const newSearchParams = new SvelteURLSearchParams([...Array.from(url.searchParams.entries())]);
		newSearchParams.delete('expanded');
		return `${url.origin}${url.pathname}${newSearchParams.size ? '?' + newSearchParams.toString() : ''}`;
	}

	function handleSummaryKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			(event.target as HTMLElement)
				.closest('li')
				?.previousElementSibling?.querySelector('summary')
				?.focus();
		}
		if (event.key === 'ArrowDown') {
			(event.target as HTMLElement)
				.closest('li')
				?.nextElementSibling?.querySelector('summary')
				?.focus();
		}
	}
</script>

<div>
	{#if Array.isArray(data) && data.length > 1}
		<div class="flex items-center justify-between pb-4">
			<h2 class="font-heading text-2xl capitalize" id="{uidPrefix}editions">
				{page.data.t('resource.editions')}
			</h2>
			<a
				href={getCollapseAllUrl(page.url)}
				data-sveltekit-preload-data="false"
				class="close-all link-subtle text-xs sm:text-sm"
				onclick={(event) => {
					event.preventDefault();
					replaceState(getCollapseAllUrl(page.url), { ...page.state, expandedInstances: [] });
				}}
			>
				{page.data.t('general.collapseAll')}
			</a>
		</div>
	{/if}

	{#if Array.isArray(data) && data.length > 1}
		<div class="column-headers mb-2 grid gap-2 text-sm font-medium">
			{#each columns as { header: columnHeader }, index (index)}
				<div class="flex flex-1 first:pl-0">
					{columnHeader}
				</div>
			{/each}
		</div>
		<ul bind:this={instancesList}>
			{#each data as item (item['@id'])}
				{@const id = relativizeUrl(getResourceId(item))}
				<li {id} class="border-neutral border-t">
					<details
						open={page.state.expandedInstances?.includes(id) ||
							page.url.searchParams.getAll('expanded').includes(id) ||
							data.length === 1}
						ontoggle={() => handleToggleDetails(page.state)}
					>
						<summary
							class="hover:bg-primary-50 grid min-h-11 items-center gap-2 align-middle text-sm"
							onkeydown={handleSummaryKeydown}
						>
							<span class="arrow text-subtle w-4 origin-center rotate-0 transition-transform">
								<BiChevronRight />
							</span>
							{#each columns as { data: columnData }, index (index)}
								<div class="flex flex-1 items-center">
									<DecoratedData data={jmespath.search(item, columnData)} />
								</div>
							{/each}
							<div class="text flex flex-1 items-center justify-end text-sm">
								{#if id && page.data.holdingsByInstanceId[id]}
									{@const myLibsWithHolding = getMyLibsFromHoldings(
										userSettings.myLibraries,
										page.data.holdingsByInstanceId[id]
									)}
									{#if myLibsWithHolding.length}
										<span class="p-2">
											<MyLibrariesIndicator libraries={myLibsWithHolding} />
										</span>
									{/if}
									<a
										href={getHoldingsLink(page.url, id)}
										class="link-subtle flex items-center self-center text-xs sm:text-sm"
										data-sveltekit-preload-data="false"
										onclick={(event) => handleClickHoldings(event, page.state, id)}
									>
										{page.data.holdingsByInstanceId[id].length}
										{page.data.holdingsByInstanceId[id].length === 1
											? page.data.t('holdings.library')
											: page.data.t('holdings.libraries')}
									</a>
								{:else}
									<span>
										{page.data.t('holdings.availableAt')} 0 {page.data.t('holdings.libraries')}
									</span>
								{/if}
							</div>
						</summary>
						<InstancesListContent data={item} {id} oneOfMany />
					</details>
				</li>
			{/each}
		</ul>
	{:else}
		<InstancesListContent data={data[0]} id="{uidPrefix}{relativizeUrl(getResourceId(data[0]))}" />
	{/if}
</div>

<style lang="postcss">
	@reference "../../../../app.css";

	.column-headers,
	summary {
		@apply grid-cols-instance-list gap-2;

		& > :last-child {
			@apply pr-1;
		}
	}

	.column-headers > :first-child {
		grid-column: span 2;
	}

	details[open] .arrow {
		rotate: 90deg;
	}
</style>
