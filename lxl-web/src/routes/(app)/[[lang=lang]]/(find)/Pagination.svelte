<script lang="ts">
	import { page } from '$app/stores';
	import type { SearchResult } from './search';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiChevronLeft from '~icons/bi/chevron-left';
	export let data: SearchResult;

	$: ({ first, last, next, totalItems, itemsPerPage, itemOffset, maxItems } = data);
	$: currentPage = Math.floor(itemOffset / itemsPerPage) + 1;
	$: isFirstPage = currentPage === 1;
	$: lastItem = totalItems > maxItems ? maxItems : totalItems;
	$: lastPage = Math.ceil(lastItem / itemsPerPage);
	$: isLastPage = currentPage === lastPage;

	// How many pages to display in a sequence (excl first & last)
	let sequenceSize = 3;

	$: if (sequenceSize > lastPage) {
		sequenceSize = lastPage;
	}
	$: sequenceStart = (() => {
		if (currentPage + (sequenceSize - 1) >= lastPage) {
			return lastPage - (sequenceSize - 1);
		} else {
			return currentPage;
		}
	})();
	$: pageSequence = [...Array(sequenceSize)].map((el, i) => sequenceStart + i);
	$: sequenceEnd = pageSequence[pageSequence.length - 1];

	function getOffsetLink(offset: number) {
		let o = offset < 0 ? 0 : offset;
		const params = new URLSearchParams($page.url.searchParams.toString());
		params.set('_offset', o.toString());
		return `${$page.url.pathname}?${params.toString()}`;
	}
</script>

{#if data.items.length > 0 && totalItems > itemsPerPage}
	<nav aria-label="paginering" data-testid="pagination">
		<ul class="my-4 flex justify-center gap-2">
			<!-- prev and first -->
			{#if !isFirstPage || itemOffset > 0}
				<li>
					<a
						class="button-ghost"
						href={getOffsetLink(itemOffset - itemsPerPage)}
						aria-label={$page.data.t('search.previous')}
						><BiChevronLeft aria-hidden="true" class="text-icon" /></a
					>
				</li>
				{#if sequenceStart > 1}
					<li>
						<a aria-label="{$page.data.t('search.page')} 1" class="button-ghost" href={first['@id']}
							>1</a
						>
					</li>
				{/if}
			{/if}
			{#if sequenceStart > 2}
				<li class="flex items-end text-3-cond-bold"><span>...</span></li>
			{/if}
			<!-- page sequence -->
			{#each pageSequence as p}
				<li>
					<a
						class={p === currentPage ? 'button-primary' : 'button-ghost hidden sm:flex'}
						href={getOffsetLink(itemsPerPage * (p - 1))}
						aria-label="{$page.data.t('search.page')} {p}"
						aria-current={p === currentPage ? 'page' : null}
						>{p.toLocaleString($page.data.locale)}</a
					>
				</li>
			{/each}
			{#if lastPage - sequenceEnd > 1}
				<li class="flex items-end text-3-cond-bold"><span>...</span></li>
			{/if}
			<!-- last and next -->
			{#if !isLastPage}
				{#if sequenceEnd !== lastPage}
					<li>
						<a
							aria-label="{$page.data.t('search.page')} {lastPage}"
							class="button-ghost"
							href={last['@id']}>{lastPage.toLocaleString($page.data.locale)}</a
						>
					</li>
				{/if}
				<li>
					<a class="button-ghost" href={next?.['@id']} aria-label={$page.data.t('search.next')}
						><BiChevronRight aria-hidden="true" class="text-icon" /></a
					>
				</li>
			{/if}
		</ul>
	</nav>
{/if}
