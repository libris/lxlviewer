<script lang="ts">
	import { page } from '$app/state';
	import { JsonLd } from '$lib/types/xl';
	import type { HeldByMyLibraries, HoldersByType } from '$lib/types/holdings';
	import type { SearchResultItem } from '$lib/types/search';
	import type { ResourceData } from '$lib/types/resourceData';
	import { getHoldingsLink, handleClickHoldings } from '$lib/utils/holdings';
	import { getCiteLink, handleClickCite } from '$lib/utils/citation';
	import MyLibsHoldingIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';
	import BiQuote from '~icons/bi/quote';
	import { LxlLens } from '$lib/types/display';

	interface Props {
		instances: SearchResultItem[] | ResourceData[];
		holdersByType: HoldersByType;
		fnurgel: string;
		myLibsHoldersByType: Record<string, HeldByMyLibraries | null>;
	}

	let { holdersByType, instances, fnurgel, myLibsHoldersByType }: Props = $props();

	function getLocalizedType(type: string) {
		const found = instances.find((instanceItem) => type === instanceItem[JsonLd.TYPE]);

		// instance can be a formatted search result
		return found?._label ?? found?.[LxlLens.CardHeading]?._label ?? type;
	}
</script>

<ul class="@container flex flex-col gap-2">
	{#each Object.keys(holdersByType) as type (type)}
		<li class="@md:self-center">
			<a
				class="btn btn-cta @md:max-w-sm"
				href={page.data.localizeHref(getHoldingsLink(page.url, type))}
				data-sveltekit-preload-data="false"
				data-testid="holding-link"
				onclick={(event) => handleClickHoldings(event, page.state, type)}
			>
				{#if myLibsHoldersByType[type]}
					<div class="mr-1 text-lg">
						<MyLibsHoldingIndicator libraries={myLibsHoldersByType[type]} />
					</div>
				{/if}
				<span class="text-nowrap">{getLocalizedType(type)}</span>
				<span class="text-2xs truncate font-normal opacity-90">
					{' · '}
					<span class="hidden @3xs:inline">{page.data.t('holdings.availableAt').toLowerCase()}</span
					>
					{holdersByType[type].length}
					{holdersByType[type].length === 1
						? page.data.t('holdings.library')
						: page.data.t('holdings.libraries')}
				</span>
			</a>
		</li>
	{/each}
	{#if instances?.length === 1}
		<a
			class="btn btn-primary h-8 self-center rounded-full px-6 py-1.5"
			href={getCiteLink(page.url, fnurgel)}
			onclick={(event) => handleClickCite(event, page.state, fnurgel)}
		>
			<BiQuote class="size-4 text-neutral-400" />
			<span>{page.data.t('citations.cite')}</span>
		</a>
	{/if}
</ul>
