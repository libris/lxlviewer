<script lang="ts">
	import { page } from '$app/stores';
	import type { SearchResult } from '$lib/types/search';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiChevronLeft from '~icons/bi/chevron-left';
	export let data: SearchResult;

	$: ({ first, last, next, previous, totalItems, itemsPerPage, itemOffset, maxItems } = data);
	$: showPagination = data.items.length > 0 && totalItems > itemsPerPage;

	$: currentPage = Math.floor(itemOffset / itemsPerPage) + 1;
	$: lastItem = totalItems > maxItems ? maxItems : totalItems;
	$: lastPage = Math.ceil(lastItem / itemsPerPage);

	// How many pages to display in a sequence (excl first & last)
	const numberOfPages = 7;
	$: sequenceSize = numberOfPages > lastPage ? lastPage : numberOfPages;

	$: pageSequence = (() => {
		let pages = [];
		let halfSequence = Math.floor(sequenceSize / 2);

		// exclude first & last pages from sequence
		let sequenceStart = currentPage - halfSequence < 2 ? 2 : currentPage - halfSequence;
		let sequenceEnd =
			currentPage + halfSequence > lastPage - 1 ? lastPage - 1 : currentPage + halfSequence;
		if (sequenceStart > sequenceEnd) {
			sequenceEnd = sequenceStart;
		}

		// add remaining pages to beginning or end
		const remainder = sequenceSize - (sequenceEnd - sequenceStart + 1);
		if (remainder && sequenceStart > 2) {
			sequenceStart = sequenceStart - remainder < 2 ? 2 : sequenceStart - remainder;
		}

		if (remainder && sequenceEnd < lastPage - 1) {
			sequenceEnd = sequenceEnd + remainder > lastPage - 1 ? lastPage - 1 : sequenceEnd + remainder;
		}

		for (let i = sequenceStart; i <= sequenceEnd; i++) {
			pages.push({ page: i, link: getOffsetLink(itemsPerPage * (i - 1)) });
		}
		return pages;
	})();

	function getOffsetLink(offset: number) {
		let o = offset < 0 ? 0 : offset;
		return `${first['@id']}&_offset=${o}`;
	}
</script>

{#if showPagination}
	<nav aria-label={$page.data.t('search.pagination')} data-testid="pagination">
		<ul class="flex justify-center overflow-hidden page-padding">
			<!-- prev -->
			{#if previous}
				<li>
					<a
						class="button-ghost"
						href={previous['@id']}
						aria-label={$page.data.t('search.previous')}
						><BiChevronLeft aria-hidden="true" class="text-icon" /></a
					>
				</li>
			{/if}
			<!-- first -->
			<li>
				<a
					aria-label="{$page.data.t('search.page')} 1"
					class={currentPage === 1 ? 'button-primary' : 'button-ghost'}
					href={first['@id']}>1</a
				>
			</li>
			{#if pageSequence[0].page > 2}
				<li class="hidden items-end text-3-cond-bold sm:flex"><span>...</span></li>
			{/if}
			<!-- page sequence -->
			{#each pageSequence as p}
				{#if p.page !== 1 && p.page !== lastPage}
					<li>
						<a
							class={p.page === currentPage
								? 'button-primary !mx-4 sm:!mx-0.5'
								: 'button-ghost hidden sm:flex'}
							href={p.link}
							aria-label="{$page.data.t('search.page')} {p}"
							aria-current={p.page === currentPage ? 'page' : null}
							>{p.page.toLocaleString($page.data.locale)}</a
						>
					</li>
				{/if}
			{/each}
			{#if lastPage - pageSequence[pageSequence.length - 1].page > 1}
				<li class="hidden items-end text-3-cond-bold sm:flex"><span>...</span></li>
			{/if}
			<!-- last -->
			<li>
				<a
					aria-label="{$page.data.t('search.page')} {lastPage}"
					class={currentPage === lastPage ? 'button-primary' : 'button-ghost'}
					href={last['@id']}>{lastPage.toLocaleString($page.data.locale)}</a
				>
			</li>
			<!-- next -->
			{#if next}
				<li>
					<a class="button-ghost" href={next['@id']} aria-label={$page.data.t('search.next')}
						><BiChevronRight aria-hidden="true" class="text-icon" /></a
					>
				</li>
			{/if}
		</ul>
	</nav>
{/if}

<style lang="postcss">
	nav li > * {
		@apply mx-0.5;
	}

	nav li > a {
		@apply min-h-11 min-w-11 !px-2;
	}
</style>
