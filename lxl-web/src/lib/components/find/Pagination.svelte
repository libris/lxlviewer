<script lang="ts">
	import { page } from '$app/state';
	import type { SearchResult } from '$lib/types/search';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiChevronLeft from '~icons/bi/chevron-left';

	type PaginationProps = {
		data: SearchResult;
	};

	const { data }: PaginationProps = $props();
	const { first, last, next, previous, totalItems, itemsPerPage, itemOffset, maxItems } =
		$derived(data);

	const numberOfPagesSm = 3;
	const numberOfPagesMd = 7;

	const showPagination = $derived(data.items.length > 0 && totalItems > itemsPerPage);
	const currentPage = $derived(Math.floor(itemOffset / itemsPerPage) + 1);
	const lastItem = $derived(totalItems > maxItems ? maxItems : totalItems);
	const lastPage = $derived(Math.ceil(lastItem / itemsPerPage));

	const pageSequenceSm = $derived.by(() => {
		let pagesSm = numberOfPagesSm > lastPage ? lastPage : numberOfPagesSm;
		return getPages(pagesSm);
	});

	const pageSequenceMd = $derived.by(() => {
		let pagesMd = numberOfPagesMd > lastPage ? lastPage : numberOfPagesMd;
		return getPages(pagesMd);
	});

	function getPages(sequenceSize: number) {
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
			pages.push({ page: i, offset: itemsPerPage * (i - 1) });
		}
		return pages;
	}

	function getOffsetLink(offset: number) {
		let o = offset < 0 ? 0 : offset;
		return `${first['@id']}&_offset=${o}`;
	}
</script>

{#snippet pagination(
	pages: {
		page: number;
		offset: number;
	}[]
)}
	<!-- prev -->
	{#if previous}
		<li>
			<a
				href={previous['@id']}
				aria-label={page.data.t('search.previous')}
				class="btn btn-primary border-0"><BiChevronLeft class="text-base" aria-hidden="true" /></a
			>
		</li>
	{/if}
	<!-- first -->
	<li>
		<a
			aria-label="{page.data.t('search.page')} 1"
			class={['btn btn-primary', currentPage === 1 ? 'bg-accent-50' : 'border-0']}
			href={first['@id']}>1</a
		>
	</li>
	{#if pages[0].page > 2}
		<li class="text-2xs flex size-8 items-end justify-center pb-2 sm:size-9"><span>...</span></li>
	{/if}
	<!-- page sequence -->
	{#each pages as p (p.offset)}
		{#if p.page !== 1 && p.page !== lastPage}
			<li>
				<a
					class={['btn btn-primary', p.page === currentPage ? 'bg-accent-50' : 'border-0']}
					href={getOffsetLink(p.offset)}
					aria-label="{page.data.t('search.page')} {p}"
					aria-current={p.page === currentPage ? 'page' : null}
					>{p.page.toLocaleString(page.data.locale)}</a
				>
			</li>
		{/if}
	{/each}
	{#if lastPage - pages[pages.length - 1].page > 1}
		<li class="text-2xs flex size-8 items-end justify-center pb-2 sm:size-9"><span>...</span></li>
	{/if}
	<!-- last -->
	<li>
		<a
			aria-label="{page.data.t('search.page')} {lastPage}"
			class={['btn btn-primary', currentPage === lastPage ? 'bg-accent-50' : 'border-0']}
			href={last['@id']}>{lastPage.toLocaleString(page.data.locale)}</a
		>
	</li>
	<!-- next -->
	{#if next}
		<li>
			<a href={next['@id']} aria-label={page.data.t('search.next')} class="btn btn-primary border-0"
				><BiChevronRight class="text-base" aria-hidden="true" /></a
			>
		</li>
	{/if}
{/snippet}

{#if showPagination}
	<nav
		aria-label={page.data.t('search.pagination')}
		data-testid="pagination"
		class="mt-4 overflow-x-hidden py-4"
	>
		<!-- sm -->
		<ul class="sm-pagination flex justify-center sm:hidden">
			{@render pagination(pageSequenceSm)}
		</ul>
		<!-- md -->
		<ul class="md-pagination hidden justify-center sm:flex">
			{@render pagination(pageSequenceMd)}
		</ul>
	</nav>
{/if}

<style>
	.md-pagination li > * {
		margin-inline: calc(var(--spacing) * 0.5);
	}

	.md-pagination li > a {
		min-height: calc(var(--spacing) * 9);
		min-width: calc(var(--spacing) * 9);
		padding-inline: calc(var(--spacing) * 2);
	}

	.sm-pagination li > a {
		min-height: calc(var(--spacing) * 8);
		min-width: calc(var(--spacing) * 8);
	}
</style>
