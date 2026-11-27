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
	import type { DisplayMode } from '#lib/types/userSettings.ts';
	import { Elem, ShowLabelsOptions } from '#lib/types/decoratedData.ts';
	import DecoratedData2 from '#lib/components/DecoratedData2.svelte';
	import MyLibsHoldingIndicator from '#lib/components/MyLibsHoldingIndicator.svelte';
	import BiHouse from '~icons/bi/house';
	import BiQuote from '~icons/bi/quote';
	import BiHeartFill from '~icons/bi/heart-fill';
	import BiHeart from '~icons/bi/heart';
	import BiBoxArrowUpRight from '~icons/bi/box-arrow-up-right';

	type Props = {
		item: SearchResultItem | LibraryResultItem;
		id: string;
		variant: DisplayMode;
	};

	const { item, id, variant = 'default' }: Props = $props();
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

<div
	class={[
		'card-actions flex flex-wrap w-full gap-1 pt-1.5 print:hidden',
		variant === 'default' && 'justify-end sm:pt-0'
		// variant === 'gallery' && 'items-end'
	]}
>
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
	<div class="text-xs">
		<DecoratedData2
			data={item.mediaLinks as DisplayDecorated}
			showLabels={ShowLabelsOptions.Never}
			allowPopovers={false}
			block
			parent={Elem.Div}
			skipOuter={true}
		/>
	</div>
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
