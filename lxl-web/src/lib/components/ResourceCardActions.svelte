<script lang="ts">
	import { page } from '$app/state';
	import { goto, preloadData } from '$app/navigation';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import { getModalContext } from '#lib/contexts/modal.svelte.ts';
	import popover from '#lib/actions/popover/index.js';
	import { isResourceNode } from '#lib/utils/resourceData.ts';
	import { getCiteLink, handleClickCite } from '#lib/utils/citation.ts';
	import { getHoldingsLink } from '#lib/utils/holdings.ts';
	import { stripAnchor } from '#lib/utils/http.ts';
	import { Fmt, JsonLd, type DisplayDecorated } from '#lib/types/xl.ts';
	import type { LibraryResultItem, SearchResultItem } from '#lib/types/search.ts';
	import { Elem, ShowLabelsOptions } from '#lib/types/decoratedData.ts';
	import DecoratedData2 from '#lib/components/DecoratedData2.svelte';
	import MyLibsHoldingIndicator from '#lib/components/MyLibsHoldingIndicator.svelte';
	import BiHouse from '~icons/bi/house';
	import BiQuote from '~icons/bi/quote';
	import BiHeartFill from '~icons/bi/heart-fill';
	import BiHeart from '~icons/bi/heart';
	import BiBoxArrowUpRight from '~icons/bi/box-arrow-up-right';
	import IconArrowRight from '~icons/bi/arrow-right';

	type Props = {
		item: SearchResultItem | LibraryResultItem;
		id: string;
	};

	const { item, id }: Props = $props();
	const modal = getModalContext();

	// better way to check if data is an instance?
	const isInstanceCard = $derived(
		item[JsonLd.TYPE] === 'PhysicalResource' || item[JsonLd.TYPE] === 'DigitalResource'
	);

	const firstMediaLink = $derived.by(() => {
		if (!item.mediaLinks || !isResourceNode(item.mediaLinks)) {
			return undefined;
		}
		const value = item.mediaLinks[Fmt.DISPLAY][0]?.[Fmt.VALUE];
		if (Array.isArray(value)) {
			return value[0]?.[JsonLd.ID];
		}
		return isResourceNode(value) ? value[JsonLd.ID] : undefined;
	});

	function isLibraryCard(item: SearchResultItem | LibraryResultItem): item is LibraryResultItem {
		if (item[JsonLd.TYPE] !== 'Library' && item[JsonLd.TYPE] !== 'bibdb:Organization') return false;
		if (!('libraryId' in item) || !('displayStr' in item)) return false;
		return true;
	}

	const bibliographyLink = $derived.by(() => {
		if (item[JsonLd.TYPE] === 'Bibliography' && item?.sigel) {
			return page.data.localizeHref(`/find?_q=bibliography:"sigel:${item.sigel}"`);
		}
		return null;
	});

	function formatNumItems(n: number | undefined) {
		if (!n) return null;
		const digits = Math.floor(Math.log10(n)) + 1;
		const factor = Math.pow(10, digits - 2);
		const rounded = Math.floor(n / factor) * factor;
		return rounded.toLocaleString();
	}

	async function handleClickHoldings(event: Event) {
		// perform a regular link navigation on find route to allow streaming with promises
		if (page.route.id === '/(app)/[[lang=lang]]/find') return;

		event.preventDefault();
		const { href } = event.currentTarget as HTMLLinkElement;
		const result = await preloadData(href);
		if (result.type === 'loaded' && result.status === 200) {
			modal.onOpen({
				searchParams: {
					holdings: stripAnchor(id) || ''
				},
				state: {
					holdingId: stripAnchor(id) || '',
					holdings: await result.data.holdings
				}
			});
		} else {
			goto(href);
		}
	}
</script>

<div class="card-actions flex justify-end w-full gap-1 pt-1.5 sm:pt-0 print:hidden">
	{#if bibliographyLink}
		{@render exploreBibliography()}
	{/if}
	{#if isLibraryCard(item)}
		{@render toggleFavLibrary(item)}
	{/if}
	{#if firstMediaLink}
		{@render freeOnline()}
	{/if}
	{#if isInstanceCard}
		{@render citeBtn()}
	{/if}
	{#if id && item.numberOfHolders >= 0 && page.data.features.holdings}
		{@render holdingsButton()}
	{/if}
</div>

{#snippet exploreBibliography()}
	<!-- numberOfItems doesn't include count from parts on parent bibliographies with parts.
    Some parents have a small number of instances directly linked to them instead of 0.
    Only show count if it looks "correct", i.e. large enough -->
	{@const numItems = formatNumItems(
		item?.numberOfItems && item.numberOfItems > 100 ? item?.numberOfItems : undefined
	)}
	<a
		href={bibliographyLink}
		class={[
			'hover:text-link focus:text-link text-sm ease-in-out hover:underline focus:underline [&>svg]:mb-0.5 [&>svg]:transition-transform hover:[&>svg]:translate-x-1'
		]}
	>
		<span class="font-medium">{page.data.t('search.exploreCollection')}</span>{numItems &&
			` (${page.data.t('general.approx')} ${numItems} ${page.data.t('search.hits')})`}
		<IconArrowRight class={['mx-0.5 inline size-4 transition-transform']} />
	</a>
{/snippet}

{#snippet freeOnline()}
	<a
		class="btn btn-primary h-7 rounded-full md:h-8"
		href={firstMediaLink}
		target="_blank"
		use:popover={{
			onFocus: false,
			snippet: mediaLinksPopover
		}}
	>
		<BiBoxArrowUpRight class="text-neutral-500" />
		<span>{page.data.t('search.existsOnline')}</span>
	</a>
{/snippet}

{#snippet citeBtn()}
	<a
		class="btn btn-primary h-7 min-w-22.5 rounded-full md:h-8"
		href={getCiteLink(page.url, id)}
		onclick={(event) => handleClickCite(event, id, modal)}
	>
		<BiQuote aria-hidden="true" class="size-4 text-neutral-500" />
		<span id={`cite-${id}`}> {page.data.t('citations.cite')}</span>
	</a>
{/snippet}

{#snippet toggleFavLibrary(item: LibraryResultItem)}
	{@const userSettings = getUserSettings()}
	{@const alreadyAdded =
		userSettings.myLibraries && Object.keys(userSettings.myLibraries).includes(item.libraryId)}
	<button
		class="btn btn-primary h-7 rounded-full md:h-8"
		type="button"
		onclick={() =>
			alreadyAdded
				? userSettings.removeLibrary(item.libraryId)
				: userSettings.addLibrary(item.libraryId)}
	>
		{#if alreadyAdded}
			<BiHeartFill aria-hidden="true" class="text-primary-600" />
			<span>{page.data.t('general.remove')}</span>
		{:else}
			<BiHeart aria-hidden="true" class="text-primary-600" />
			<span>{page.data.t('general.add')}</span>
		{/if}
		<span class="sr-only">{page.data.t('myPages.favouriteLibrary')}</span>
		<span class="sr-only">{item.displayStr}</span>
	</button>
{/snippet}

{#snippet mediaLinksPopover()}
	<DecoratedData2
		data={item.mediaLinks as DisplayDecorated}
		showLabels={ShowLabelsOptions.Never}
		allowPopovers={false}
		block
		parent={Elem.Div}
		skipOuter={true}
	/>
{/snippet}

{#snippet holdingsButton()}
	<a
		class="btn btn-primary h-7 min-w-28 rounded-full md:h-8"
		href={page.data.localizeHref(getHoldingsLink(page.url, id))}
		data-sveltekit-preload-data={isInstanceCard ? 'false' : ''}
		data-sveltekit-reset="false"
		data-testid="holding-link"
		onclick={handleClickHoldings}
	>
		<span class="text-base">
			{#if item.heldByMyLibraries}
				<MyLibsHoldingIndicator libraries={item.heldByMyLibraries} />
			{:else}
				<BiHouse class="text-neutral-500" />
			{/if}
		</span>
		{#if item.heldBySubset}
			<span>{page.data.t('holdings.findTitle')}</span>
		{:else}
			<span>
				{item.numberOfHolders}
				{page.data.t('search.libraries')}
			</span>
		{/if}
		{#if item.heldByMyLibraries}
			<span class="sr-only"
				>{`. ${page.data.t('holdings.availableAt')}`}
				{`${page.data.t('myPages.favouriteLibrary')}`}</span
			>
		{/if}
	</a>
{/snippet}

<style lang="postcss">
	.card-actions {
		grid-area: actions;
	}
</style>
