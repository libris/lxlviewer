<script lang="ts">
	import { page } from '$app/state';
	import SuperSearchFallback from '$lib/components/supersearch/SuperSearchFallback.svelte';
	import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import { displayMappingToString } from '$lib/utils/displayMappingToString';
	import { baseLocale } from '$lib/i18n/locales';
	import { getSearchContext } from '$lib/contexts/search';

	type Props = {
		id: string;
		ariaLabelledBy?: string;
	};

	let { id, ariaLabelledBy }: Props = $props();

	const searchContext = getSearchContext();

	let initialValueBeforeMount: string = $state(page.url.searchParams.get('_q') || '');
	let initialSelectionBeforeMount: { anchor: number; head: number } | undefined = $state();

	let cursor: number | null = $state(null);

	const action = $derived(page.data.locale === baseLocale ? '/find' : `/${page.data.locale}/find`);

	const ariaLabel = $derived(page.data.t('header.search'));
	const placeholder: string = $derived(
		page.data.subsetMapping
			? `${page.data.t('header.searchSubsetPlaceholder')}: ${displayMappingToString(page.data.subsetMapping)}`
			: page.data.t('header.searchPlaceholder')
	);
	const autofocus = $derived(undefined /* isHomeRoute ? true : undefined */);

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
	<SuperSearchFallback
		{id}
		{placeholder}
		{ariaLabelledBy}
		{ariaLabel}
		bind:value={initialValueBeforeMount}
		bind:selection={initialSelectionBeforeMount}
	/>
{/snippet}

<search {id} class={['@container z-41 mx-auto grid h-full w-full max-w-7xl items-center lg:px-3']}>
	<form id={`${id}-form`} {action} class="mx-auto w-full min-w-0">
		{#await import('$lib/components/supersearch/SuperSearchWrapper.svelte')}
			{@render fallbackInput()}
		{:then { default: SuperSearchWrapper }}
			<div class="contents" data-testid="supersearch">
				<SuperSearchWrapper
					{id}
					{placeholder}
					collapsedAriaLabelledBy={ariaLabelledBy}
					collapsedAriaLabel={ariaLabel}
					expandedAriaLabel={page.data.t('header.search')}
					onCursorChange={(value) => (cursor = value)}
					qualifierSuggestions={page.data.qualifierSuggestions || []}
					{autofocus}
					{initialValueBeforeMount}
					{initialSelectionBeforeMount}
					editor={searchContext.lastUpdatedEditor}
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
	</form>
</search>

<style lang="postcss">
	@reference 'tailwindcss';
	search {
		--search-input-height: 48px;

		@variant sm {
			--search-input-height: 52px;
		}

		@variant 2xl {
			--search-input-height: 56px;
		}
	}
</style>
