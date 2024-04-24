<script lang="ts">
	import type { ResourceData } from '$lib/types/ResourceData';
	import { page } from '$app/stores';
	import { goto, replaceState } from '$app/navigation';
	import jmespath from 'jmespath';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { getResourceId } from '$lib/utils/resourceData';
	import { relativizeUrl } from '$lib/utils/http';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import ResourceImage from '$lib/components/ResourceImage.svelte';
	import { getHoldingsLink, handleClickHoldings } from './utils';
	import BiChevronRight from '~icons/bi/chevron-right';

	/**
	 * TODO:
	 * - [] Replace jmespath (used for queriyng data for the columns) with something more home-baked (with smaller bundle-size). Another alternative could be querying and preparing the column data server-side?
	 * - [] Add tests (e.g. rows should be expandable and permalink should work, and that opened state should be saved when navigating forward and backwards). The tests should probably be placed inside +page.svelte...
	 */

	let instancesList: HTMLUListElement;

	export let data: ResourceData;
	export let columns: string[];

	function handleToggleDetails(state: { expandedInstances?: string[] }) {
		let openIds: string[] = [];
		instancesList.querySelectorAll('details[open]').forEach((openElement) => {
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
		const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
		newSearchParams.delete('expanded');
		return `${url.origin}${url.pathname}${newSearchParams.size ? '?' + newSearchParams.toString() : ''}`;
	}

	function getPermalink(url: URL, id: string) {
		const newSearchParams = new URLSearchParams({ expanded: id });
		return `${url.origin}${url.pathname}?${newSearchParams.toString()}#${id}`;
	}

	function handleCopyPermalink(
		event: MouseEvent,
		url: URL,
		id: string,
		state: {
			expandedInstances?: string[];
		}
	) {
		event.preventDefault();
		const permalink = getPermalink(url, id);
		navigator.clipboard.writeText(permalink.toString());
		goto(permalink, {
			state: {
				...state,
				expandedInstances: [id]
			}
		});
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
		<div class="flex justify-end py-4">
			<a
				href={getCollapseAllUrl($page.url)}
				data-sveltekit-preload-data="false"
				class="close-all"
				on:click={(event) => {
					event.preventDefault();
					replaceState(getCollapseAllUrl($page.url), { ...$page.state, expandedInstances: [] });
				}}
			>
				{$page.data.t('general.collapseAll')}
			</a>
		</div>
	{/if}

	{#if Array.isArray(data)}
		<ul bind:this={instancesList}>
			{#each data as item (item['@id'])}
				{@const id = relativizeUrl(getResourceId(item))}
				<li {id} class="border-t border-t-primary/16">
					<details
						open={$page.state.expandedInstances?.includes(id) ||
							$page.url.searchParams.getAll('expanded').includes(id) ||
							data.length === 1}
						on:toggle={() => handleToggleDetails($page.state)}
					>
						<summary
							class="flex min-h-11 gap-2 pl-1 align-middle hover:bg-pill/16"
							on:keydown={handleSummaryKeydown}
						>
							<span class="arrow flex items-center pr-2">
								<BiChevronRight />
							</span>
							{#each columns as columnItem}
								<div class="flex flex-1 items-center">
									<DecoratedData data={jmespath.search(item, columnItem)} />
								</div>
							{/each}
							<div class="text flex flex-1 items-center justify-end text-sm">
								{#if id && $page.data.holdingsByInstanceId[id]}
									<a
										href={getHoldingsLink($page.url, id)}
										class="flex items-center self-center px-2"
										data-sveltekit-preload-data="false"
										on:click={(event) => handleClickHoldings(event, $page.state, id)}
									>
										{$page.data.holdingsByInstanceId[id].length}
										{$page.data.holdingsByInstanceId[id].length === 1
											? $page.data.t('holdings.library')
											: $page.data.t('holdings.libraries')}
									</a>
								{:else}
									<span>
										{$page.data.t('holdings.availableAt')} 0 {$page.data.t('holdings.libraries')}
									</span>
								{/if}
							</div>
						</summary>
						<div class="grid gap-2 px-2 pb-8 pt-4 md:grid-cols-3">
							<div class="flex flex-col gap-4 text-sm">
								<div class="flex h-full max-h-32 w-full max-w-32">
									<ResourceImage
										resource={item}
										alt={$page.data.t('general.instanceCover')}
										linkToFull
									/>
								</div>
								{#if id && $page.data.holdingsByInstanceId[id]}
									<div class="flex flex-col gap-2">
										<a
											href={getHoldingsLink($page.url, id)}
											data-sveltekit-preload-data="false"
											on:click={(event) => handleClickHoldings(event, $page.state, id)}
										>
											{$page.data.t('holdings.availableAt')}
											{$page.data.holdingsByInstanceId[id].length}
											{$page.data.holdingsByInstanceId[id].length === 1
												? $page.data.t('holdings.library')
												: $page.data.t('holdings.libraries')}
										</a>
										<a
											href={getPermalink($page.url, id)}
											on:click={(event) => handleCopyPermalink(event, $page.url, id, $page.state)}
										>
											{$page.data.t('general.copyPermalinkToInstance')}
										</a>
									</div>
								{/if}
							</div>
							<div class="instance-details col-span-2">
								<DecoratedData data={item} block showLabels={ShowLabelsOptions.Always} />
							</div>
						</div>
					</details>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="postcss">
	.close-all {
		@apply text-sm;
		&[disabled] {
			@apply text-disabled;
		}
	}

	:global(.instance-details > div) {
		@apply gap-2 lg:columns-2;
	}

	:global(.instance-details > div div[data-property]) {
		@apply mb-4;
	}

	:global(.instance-details > div > *) {
		break-inside: avoid-column;
	}

	details[open] > summary {
		@apply bg-pill/8 hover:bg-pill/16;
	}

	details[open] > summary .arrow {
		@apply rotate-90 transition-transform;
	}
</style>
