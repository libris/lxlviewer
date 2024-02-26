<script lang="ts">
	import { page } from '$app/stores';
	import { relativizeUrl } from '$lib/utils/http';
	import type { SearchResult } from './search';
	export let data: SearchResult;

	$: ({ first, last, next, totalItems, itemsPerPage, itemOffset } = data);
	$: currentPage = Math.floor(itemOffset / itemsPerPage) + 1;
	$: isFirstPage = currentPage === 1;
	$: lastPage = Math.ceil(totalItems / itemsPerPage);
	$: isLastPage = currentPage === lastPage;

	const sequenceSize = [...Array(2)];
	$: sequenceStart = (() => {
		if (isLastPage) return currentPage - 1;
		else return currentPage;
	})();
	$: pageSequence = sequenceSize.map((el, i) => sequenceStart + i);
	$: sequenceEnd = pageSequence[pageSequence.length - 1];

	function getOffsetLink(offset: number) {
		let o = offset < 0 ? 0 : offset;
		const params = $page.url.searchParams;
		params.set('_offset', o.toString());
		return `find?${params.toString()}`;
	}
</script>

{#if data.items.length > 0 && totalItems > itemsPerPage}
	<nav aria-label="paginering">
		<ul class="my-4 flex justify-center gap-2">
			<!-- prev and first -->
			{#if !isFirstPage || itemOffset > 0}
				<li>
					<a href={getOffsetLink(itemOffset - itemsPerPage)} aria-label="Föregående sida">←</a>
				</li>
				{#if sequenceStart > 1}
					<li><a href={relativizeUrl(first['@id'])}>1</a></li>
				{/if}
			{/if}
			{#if sequenceStart > 2}
				<span>...</span>
			{/if}
			<!-- page sequence -->
			{#each pageSequence as p}
				<a
					href={getOffsetLink(itemsPerPage * (p - 1))}
					aria-label="Sida {p}"
					aria-current={p === currentPage ? 'page' : false}>{p}</a
				>
			{/each}
			{#if lastPage - sequenceEnd > 1}
				<span>...</span>
			{/if}
			<!-- last and next -->
			{#if !isLastPage}
				{#if sequenceEnd !== lastPage}
					<li><a href={relativizeUrl(last['@id'])}>{lastPage}</a></li>
				{/if}
				<li><a href={relativizeUrl(next?.['@id'])} aria-label="Nästa sida">→</a></li>
			{/if}
		</ul>
	</nav>
{/if}

<style>
	[aria-current='page'] {
		@apply rounded-md border border-primary px-1 no-underline;
	}
</style>
