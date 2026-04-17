<script lang="ts">
	import { page } from '$app/state';
	import SuperSearchFallback from '$lib/components/supersearch/SuperSearchFallback.svelte';
	import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import { displayMappingToString } from '$lib/utils/displayMappingToString';

	let cursor: number | null = $state(null);

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');

	const ariaLabelledBy = $derived(isHomeRoute ? 'page-title' : undefined);
	const ariaLabel = $derived(!isHomeRoute ? page.data.t('header.search') : undefined);
	const placeholder: string = $derived(
		page.data.subsetMapping
			? `${page.data.t('header.searchSubsetPlaceholder')}: ${displayMappingToString(page.data.subsetMapping)}`
			: page.data.t('header.searchPlaceholder')
	);
	const autofocus = $derived(isHomeRoute ? true : undefined);

	const pageParams = $derived.by(() => {
		let p = getSortedSearchParams(addDefaultSearchParams(page.url.searchParams));
		// Always reset these params on new search
		p.set('_offset', '0');
		p.delete('_i');
		p.delete('_o');
		p.delete('_p');

		if (cursor) {
			p.set('_cursor', cursor.toString());
		}
		return p;
	});
</script>

{#snippet fallbackInput()}
	<SuperSearchFallback {placeholder} {ariaLabelledBy} {ariaLabel} {autofocus} />
{/snippet}

{#await import('$lib/components/supersearch/SuperSearchWrapper.svelte')}
	{@render fallbackInput()}
{:then { default: SuperSearchWrapper }}
	<div class="contents" data-testid="supersearch">
		<SuperSearchWrapper
			{placeholder}
			collapsedAriaLabelledBy={ariaLabelledBy}
			collapsedAriaLabel={ariaLabel}
			expandedAriaLabel={page.data.t('header.search')}
			onCursorChange={(value) => (cursor = value)}
			qualifierSuggestions={page.data.qualifierSuggestions || []}
			{autofocus}
		/>
	</div>
{:catch}
	{@render fallbackInput()}
{/await}
{#each Array.from(pageParams) as [name, value], i (name + i)}
	{#if name !== '_q'}
		<input type="hidden" {name} {value} />
	{/if}
{/each}
