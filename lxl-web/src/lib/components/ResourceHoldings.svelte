<script lang="ts">
	import { page } from '$app/state';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { JsonLd } from '$lib/types/xl';
	import type { HoldingsData } from '$lib/types/holdings';
	import type { SearchResultItem } from '$lib/types/search';
	import type { ResourceData } from '$lib/types/resourceData';
	import { LxlLens } from '$lib/types/display';
	import { getLibraryIdsFromMapping } from '$lib/utils/getLibraryIdsFromMapping';
	import { getHoldingsLink, getLibsFromHoldings, handleClickHoldings } from '$lib/utils/holdings';
	import MyLibsHoldingIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';

	interface Props {
		instances: SearchResultItem[] | ResourceData[];
		holdings: HoldingsData;
	}

	let { holdings, instances }: Props = $props();
	const { myLibraries } = getUserSettings();
	const subsetLibraries = $derived(
		getLibraryIdsFromMapping([page.data.subsetMapping]) || undefined
	);

	function getLocalizedType(type: string) {
		const found = instances.find((instanceItem) => type === instanceItem[JsonLd.TYPE]);

		// instance can be a formatted search result
		return found?._label ?? found?.[LxlLens.CardHeading]?._label ?? type;
	}
</script>

<ul class="@container flex flex-col gap-2">
	{#each Object.keys(holdings.byType) as type (type)}
		{@const myLibsHoldingByType = getLibsFromHoldings(
			myLibraries,
			holdings.byType[type],
			page.data.refinedOrgs
		)}
		{@const subsetHoldingByType = getLibsFromHoldings(
			subsetLibraries,
			holdings.byType[type],
			page.data.refinedOrgs
		)}
		<li class="@md:self-center">
			<!-- use regular btn if subset library but no holding for type -->
			<a
				class={[
					'btn @md:max-w-sm',
					!subsetLibraries || (subsetLibraries && subsetHoldingByType)
						? 'btn-cta'
						: 'btn-primary h-10 rounded-full text-sm'
				]}
				href={page.data.localizeHref(getHoldingsLink(page.url, type))}
				data-sveltekit-preload-data="false"
				data-testid="holding-link"
				onclick={(event) => handleClickHoldings(event, page.state, type)}
			>
				{#if myLibsHoldingByType}
					<div class="mr-1 text-lg">
						<MyLibsHoldingIndicator libraries={myLibsHoldingByType} />
					</div>
				{/if}
				<span class="text-nowrap">{getLocalizedType(type)}</span>
				<span class="truncate font-normal opacity-90">
					{' · '}
					{#if subsetLibraries && subsetHoldingByType}
						<span>{page.data.t('holdings.findTitle')}</span>
					{:else}
						<span>
							{holdings.byType[type].length}
							{holdings.byType[type].length === 1
								? page.data.t('holdings.library')
								: page.data.t('holdings.libraries')}
						</span>
					{/if}
				</span>
			</a>
		</li>
	{/each}
</ul>
