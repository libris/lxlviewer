<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import type { AdjecentSearchResult } from '$lib/types/search';
	import { relativizeUrl } from '$lib/utils/http';
	import IconChevronLeft from '~icons/bi/chevron-left';
	import IconChevronRight from '~icons/bi/chevron-right';
	import capitalize from '$lib/utils/capitalize';
	import { getPreviousItemFnurgel, getNextItemFnurgel } from '$lib/utils/adjecentSearchResult';
	import { getAdjecentSearchResult } from '$lib/remotes/searchResult.remote';

	type Props = {
		fnurgel: string;
		adjecentSearchResults: AdjecentSearchResult[];
	};

	const { fnurgel, adjecentSearchResults: adjecentSearchResultsFromPageState }: Props = $props();

	let previousQuery: ReturnType<typeof getAdjecentSearchResult> | undefined = $state();
	let nextQuery: ReturnType<typeof getAdjecentSearchResult> | undefined = $state();

	let adjecentSearchResults = $derived(adjecentSearchResultsFromPageState);

	const currentSearchResult = $derived(
		adjecentSearchResults?.find((searchResult) =>
			searchResult.items.find((item) => item['@id']?.includes(fnurgel))
		)
	);

	const currentSearchResultIndex = $derived(
		adjecentSearchResults?.findIndex(
			(searchResult) => searchResult['@id'] === currentSearchResult?.['@id']
		)
	);

	const itemIndex = $derived(
		currentSearchResult?.items.findIndex((item) => item['@id']?.includes(fnurgel))
	);

	const indexOfTotalSearchResults = $derived(
		currentSearchResult && typeof itemIndex === 'number' && itemIndex >= 0
			? currentSearchResult?.itemOffset + itemIndex
			: undefined
	);

	const previousItemFnurgel = $derived(
		getPreviousItemFnurgel(adjecentSearchResults, currentSearchResultIndex, itemIndex)
	);

	const nextItemFnurgel = $derived(
		getNextItemFnurgel(adjecentSearchResults, currentSearchResultIndex, itemIndex)
	);

	function passAlongAdjecentSearchResults(event: MouseEvent) {
		event.preventDefault();
		goto((event.currentTarget as HTMLAnchorElement).href, {
			state: {
				...page.state,
				adjecentSearchResults: $state.snapshot(adjecentSearchResults)
			}
		});
	}

	afterNavigate(() => {
		if (
			!previousItemFnurgel &&
			currentSearchResult?.previous?.['@id'] &&
			!adjecentSearchResults?.find((i) => i['@id'] === currentSearchResult.previous?.['@id'])
		) {
			previousQuery = getAdjecentSearchResult(currentSearchResult.previous['@id']);
		}
		if (
			!nextItemFnurgel &&
			currentSearchResult?.next?.['@id'] &&
			!adjecentSearchResults?.find((i) => i['@id'] === currentSearchResult.next?.['@id'])
		) {
			nextQuery = getAdjecentSearchResult(currentSearchResult.next['@id']);
		}
	});

	$effect(() => {
		if (
			previousQuery?.current &&
			!adjecentSearchResults.find(
				(searchResult) => searchResult['@id'] === previousQuery?.current?.['@id']
			)
		) {
			adjecentSearchResults = [previousQuery.current, ...adjecentSearchResults];
		}
	});

	$effect(() => {
		if (
			nextQuery?.current &&
			!adjecentSearchResults.find(
				(searchResult) => searchResult['@id'] === nextQuery?.current?.['@id']
			)
		) {
			adjecentSearchResults = [...adjecentSearchResults, nextQuery.current];
		}
	});
</script>

{#snippet previousResultContent()}
	<IconChevronLeft class="mr-0.5 inline" />{page.data.t('resource.previous')}
{/snippet}

{#snippet nextResultContent()}
	{page.data.t('resource.next')}<IconChevronRight class="ml-0.5 inline" />
{/snippet}

{#if currentSearchResult}
	<div class="text-2xs my-1 flex items-center gap-2 px-3 @7xl:text-xs">
		{#if typeof indexOfTotalSearchResults === 'number'}
			<a
				href={page.data.localizeHref(relativizeUrl(currentSearchResult['@id']) + `#${fnurgel}`)}
				class="link flex min-h-8 whitespace-nowrap @7xl:min-h-9 [&>*]:items-center"
			>
				<span class="flex @xl:hidden">{page.data.t('resource.showInSearchResultsShort')}</span>
				<span class="hidden @xl:flex">{page.data.t('resource.showInSearchResults')}</span>
			</a>
			<span class="truncate">
				{capitalize(page.data.t('resource.result'))}
				<span class="font-medium">
					{(indexOfTotalSearchResults + 1).toLocaleString(page.data.locale)}
				</span>
				{page.data.t('resource.resultOf')}
				<span class="font-medium">
					{currentSearchResult.totalItems.toLocaleString(page.data.locale)}
				</span>
			</span>
		{/if}
		<span class="ml-auto flex items-center gap-2">
			<span
				class="after:text-subtle flex items-center after:ml-2 after:content-['·'] [&>*]:whitespace-nowrap"
			>
				{#if previousItemFnurgel}
					<a
						href={page.data.localizeHref(previousItemFnurgel + page.url.search)}
						class="link flex min-h-8 items-center @7xl:min-h-9"
						onclick={passAlongAdjecentSearchResults}
					>
						{@render previousResultContent()}
					</a>
				{:else}
					<span class="text-disabled">
						{@render previousResultContent()}
					</span>
				{/if}
			</span>
			<span class="flex [&>*]:whitespace-nowrap">
				{#if nextItemFnurgel}
					<a
						href={page.data.localizeHref(nextItemFnurgel + page.url.search)}
						class="link flex min-h-8 items-center @7xl:min-h-9"
						onclick={passAlongAdjecentSearchResults}
					>
						{@render nextResultContent()}
					</a>
				{:else}
					<span class="text-disabled">
						{@render nextResultContent()}
					</span>
				{/if}
			</span>
		</span>
	</div>
{/if}
