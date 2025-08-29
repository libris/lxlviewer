<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import type { AdjecentSearchResult } from '$lib/types/search';
	import { relativizeUrl } from '$lib/utils/http';
	import IconChevronLeft from '~icons/bi/chevron-left';
	import IconChevronRight from '~icons/bi/chevron-right';
	import capitalize from '$lib/utils/capitalize';
	import { getPreviousItemFnurgel, getNextItemFnurgel } from '$lib/utils/adjecentSearchResult';
	import { getAdjecentSearchResult } from '$lib/remotes/adjecentSearchResult.remote';

	type Props = {
		fnurgel: string;
		adjecentSearchResults: AdjecentSearchResult[];
	};

	const { fnurgel, adjecentSearchResults: adjecentSearchResultsFromPageState }: Props = $props();

	let previousQuery: ReturnType<typeof getAdjecentSearchResult> | undefined = $state();
	let nextQuery: ReturnType<typeof getAdjecentSearchResult> | undefined = $state();

	let adjecentSearchResults = $state(adjecentSearchResultsFromPageState);

	const currentSearchResult = $derived(
		adjecentSearchResults?.find((searchResult) =>
			searchResult.items.find((item) => item['@id'].includes(fnurgel))
		)
	);

	const currentSearchResultIndex = $derived(
		adjecentSearchResults?.findIndex(
			(searchResult) => searchResult['@id'] === currentSearchResult?.['@id']
		)
	);

	const itemIndex = $derived(
		currentSearchResult?.items.findIndex((item) => item['@id'].includes(fnurgel))
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
	<div class="@container flex min-h-12 items-center gap-2 text-xs">
		{#if typeof indexOfTotalSearchResults === 'number'}
			<a href={relativizeUrl(currentSearchResult['@id'])} class="link text-2xs whitespace-nowrap">
				<span class="@xl:hidden">{page.data.t('resource.showInSearchResultsShort')}</span>
				<span class="hidden @xl:inline">{page.data.t('resource.showInSearchResults')}</span>
			</a>
			<span class="text-2xs truncate">
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
		<span class="text-2xs ml-auto flex gap-2">
			<span class="after:text-subtle after:ml-2 after:content-['·']">
				{#if previousItemFnurgel}
					<a href={previousItemFnurgel} class="link" onclick={passAlongAdjecentSearchResults}>
						{@render previousResultContent()}
					</a>
				{:else}
					<span class="text-disabled">
						{@render previousResultContent()}
					</span>
				{/if}
			</span>
			<span>
				{#if nextItemFnurgel}
					<a href={nextItemFnurgel} class="link" onclick={passAlongAdjecentSearchResults}>
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
