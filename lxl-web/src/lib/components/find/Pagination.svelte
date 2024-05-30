<script lang="ts">
	import { page } from '$app/stores';
	import type { SearchResult } from '$lib/types/search';
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
	const MAX_SIZE = 8;
	$: sequenceSize = MAX_SIZE > lastPage ? lastPage : MAX_SIZE;

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
		return `${first['@id']}&_offset=${o}`;
	}
</script>

{#if data.items.length > 0 && totalItems > itemsPerPage}
	<nav aria-label={$page.data.t('search.pagination')} data-testid="pagination">
		<ul class="flex justify-center overflow-hidden page-padding">
			<!-- prev -->
			{#if !isFirstPage || itemOffset > 0}
				<li>
					<a
						class="button-ghost"
						href={getOffsetLink(itemOffset - itemsPerPage)}
						aria-label={$page.data.t('search.previous')}
						><BiChevronLeft aria-hidden="true" class="text-icon" /></a
					>
				</li>
			{/if}
			<!-- first -->
			<li>
				<a
					aria-label="{$page.data.t('search.page')} 1"
					class={isFirstPage ? 'button-primary' : 'button-ghost'}
					href={first['@id']}>1</a
				>
			</li>
			{#if sequenceStart > 2}
				<li class="hidden items-end text-3-cond-bold sm:flex"><span>...</span></li>
			{/if}
			<!-- page sequence -->
			{#each pageSequence as p}
				{#if p !== 1 && p !== lastPage}
					<li>
						<a
							class={p === currentPage
								? 'button-primary !mx-4 sm:!mx-0.5'
								: 'button-ghost hidden sm:flex'}
							href={getOffsetLink(itemsPerPage * (p - 1))}
							aria-label="{$page.data.t('search.page')} {p}"
							aria-current={p === currentPage ? 'page' : null}
							>{p.toLocaleString($page.data.locale)}</a
						>
					</li>
				{/if}
			{/each}
			{#if lastPage - sequenceEnd > 1}
				<li class="hidden items-end text-3-cond-bold sm:flex"><span>...</span></li>
			{/if}
			<!-- last -->
			<li>
				<a
					aria-label="{$page.data.t('search.page')} {lastPage}"
					class={isLastPage ? 'button-primary' : 'button-ghost'}
					href={last['@id']}>{lastPage.toLocaleString($page.data.locale)}</a
				>
			</li>
			<!-- next -->
			{#if next}
				<li>
					<a class="button-ghost" href={next?.['@id']} aria-label={$page.data.t('search.next')}
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
