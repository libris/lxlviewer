<script lang="ts">
	import { page } from '$app/state';
	import { beforeNavigate, afterNavigate, goto } from '$app/navigation';
	import type { AdjecentSearchResult } from '$lib/types/search';
	import { relativizeUrl } from '$lib/utils/http';
	import IconListUl from '~icons/bi/chevron-right';
	import IconChevronRight from '~icons/bi/chevron-right';
	import IconChevronleft from '~icons/bi/chevron-left';
	import capitalize from '$lib/utils/capitalize';
	import { getPreviousItemFnurgel, getNextItemFnurgel } from '$lib/utils/adjecentSearchResults';
	import { getAdjecentSearchResult } from '$lib/remotes/adjecentSearchResult.remote';

	type Props = {
		fnurgel: string;
		adjecentSearchResults: AdjecentSearchResult[];
	};

	const { fnurgel, adjecentSearchResults: adjecentSearchResultsFromPageState }: Props = $props();

	let previousResultsQuery: ReturnType<typeof getAdjecentSearchResult> | undefined = $state();
	let nextResultsQuery: ReturnType<typeof getAdjecentSearchResult> | undefined = $state();

	const adjecentSearchResults = $derived([
		...(previousResultsQuery?.current ? [previousResultsQuery.current] : []),
		...adjecentSearchResultsFromPageState,
		...(nextResultsQuery?.current ? [nextResultsQuery.current] : [])
	]);

	const searchResult = $derived(
		adjecentSearchResults?.find((searchResult) =>
			searchResult.items.find((item) => item['@id'].includes(fnurgel))
		)
	);

	/** Could we do get current search result and index in one go? */
	const searchResultIndex = $derived(
		adjecentSearchResults?.findIndex((searchResult) =>
			searchResult.items.find((item) => item['@id'].includes(fnurgel))
		)
	);

	const itemIndex = $derived(
		searchResult?.items.findIndex((item) => item['@id'].includes(fnurgel))
	);

	const indexOfTotalSearchResults = $derived(
		searchResult && typeof itemIndex === 'number' && itemIndex >= 0
			? searchResult?.itemOffset + itemIndex
			: undefined
	);

	const previousItemFnurgel = $derived(
		getPreviousItemFnurgel(adjecentSearchResults, searchResultIndex, itemIndex)
	);

	const nextItemFnurgel = $derived(
		getNextItemFnurgel(adjecentSearchResults, searchResultIndex, itemIndex)
	);

	function handleClickNextItem(event: MouseEvent) {
		event.preventDefault();
		goto((event.currentTarget as HTMLAnchorElement).href, {
			state: {
				...page.state,
				adjecentSearchResults
			}
		});
	}

	function handleClickPreviousItem(event: MouseEvent) {
		event.preventDefault();
		goto((event.currentTarget as HTMLAnchorElement).href, {
			state: {
				...page.state,
				adjecentSearchResults
			}
		});
	}

	beforeNavigate(() => {
		/* Reset queries on navigation */
		if (previousResultsQuery || nextResultsQuery) {
			previousResultsQuery = undefined;
			nextResultsQuery = undefined;
		}
	});

	afterNavigate(() => {
		if (
			!previousItemFnurgel &&
			searchResult?.previous?.['@id'] &&
			!adjecentSearchResults?.find((i) => i['@id'] === searchResult.previous?.['@id'])
		) {
			previousResultsQuery = getAdjecentSearchResult(searchResult.previous['@id']);
		}
		if (
			!nextItemFnurgel &&
			searchResult?.next?.['@id'] &&
			!adjecentSearchResults?.find((i) => i['@id'] === searchResult.next?.['@id'])
		) {
			nextResultsQuery = getAdjecentSearchResult(searchResult.next['@id']);
		}
	});
</script>

{#snippet previousResultContent()}
	<IconChevronleft class="inline" />
	{page.data.t('resource.previous')}
	<span class="hidden @xl:inline">{page.data.t('resource.result')}</span>
{/snippet}

{#snippet nextResultContent()}
	{page.data.t('resource.next')}
	<span class="hidden @xl:inline">{page.data.t('resource.result')}</span>
	<IconChevronRight class="inline" />
{/snippet}

{#if searchResult}
	<div class="flex min-h-12 items-center gap-1 text-xs">
		<a
			href={relativizeUrl(searchResult['@id'])}
			class="btn btn-primary inline-block whitespace-nowrap"
		>
			<IconListUl class="inline" />
			<span class="@xl:hidden">{page.data.t('resource.showInSearchResultsShort')}</span>
			<span class="hidden @xl:inline">{page.data.t('resource.showInSearchResults')}</span>
		</a>
		{#if indexOfTotalSearchResults}
			<span class="text-2xs ml-1 truncate">
				{capitalize(page.data.t('resource.result'))}
				<span class="font-medium">
					{(indexOfTotalSearchResults + 1).toLocaleString(page.data.locale)}
				</span>
				{page.data.t('resource.resultOf')}
				<span class="font-medium">
					{searchResult.totalItems.toLocaleString(page.data.locale)}
				</span>
			</span>
		{/if}
		{#if previousItemFnurgel || nextItemFnurgel}
			<span class="ml-auto flex gap-2">
				{#if previousItemFnurgel}
					<a href={previousItemFnurgel} class="btn btn-primary" onclick={handleClickPreviousItem}>
						{@render previousResultContent()}
					</a>
				{:else}
					<span class="text-disabled btn btn-primary">
						{@render previousResultContent()}
					</span>
				{/if}
				{#if nextItemFnurgel}
					<a href={nextItemFnurgel} class="btn btn-primary" onclick={handleClickNextItem}>
						{@render nextResultContent()}
					</a>
				{:else}
					<span class="text-disabled btn btn-primary">
						{@render nextResultContent()}
					</span>
				{/if}
			</span>
		{/if}
	</div>
{/if}
