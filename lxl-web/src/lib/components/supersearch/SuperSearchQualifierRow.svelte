<script lang="ts">
	import { page } from '$app/state';
	import { getSearchContext } from '$lib/contexts/search';
	import { Mode } from '$lib/types/supersearch';
	import IconFilter from '~icons/bi/sliders';
	import IconBack from '~icons/bi/chevron-left';

	type Props = {
		rowIndex?: number;
		getCellId?: (rowIndex: number, cellIndex: number) => string | undefined;
		isFocusedRow?: (rowIndex: number) => boolean | undefined;
		isFocusedCell?: (rowIndex: number, cellIndex: number) => boolean | undefined;
	};

	let { rowIndex = undefined, getCellId, isFocusedRow, isFocusedCell }: Props = $props();

	const searchContext = getSearchContext();

	const { DEFAULT_MODE } = $derived(
		Object.fromEntries(Object.keys(Mode).map((mode) => [mode, searchContext.mode === mode]))
	);

	function handleClickLeadingButton() {
		if (DEFAULT_MODE) {
			searchContext.mode = Mode.SELECT_QUALIFIER_KEY_MODE;
		} else {
			searchContext.mode = Mode.DEFAULT_MODE;
		}
		searchContext.showExpandedSearch({ focusRow: 0 });
	}
</script>

<div
	role="row"
	class={['mb-2.5 flex items-center px-2 pr-2 sm:mb-3 lg:px-3', isFocusedRow && 'focused-row']}
>
	<button
		type="button"
		id={rowIndex ? getCellId?.(rowIndex, 0) : undefined}
		class={[
			'bg-page/75 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-neutral-300',
			rowIndex && isFocusedCell?.(rowIndex, 0) && 'focused-cell',
			DEFAULT_MODE ? 'text-link' : 'text-subtle hidden sm:flex'
		]}
		onclick={handleClickLeadingButton}
		title={DEFAULT_MODE
			? `${page.data.t('supersearch.show')} ${page.data.t('supersearch.filter').toLowerCase()} (Shift+7)`
			: undefined}
		aria-label={!DEFAULT_MODE ? page.data.t('supersearch.back') : undefined}
	>
		<div class="flex w-11 items-center justify-center">
			{#if DEFAULT_MODE}
				<IconFilter />
			{:else}
				<IconBack class="size-4.5" />
			{/if}
		</div>
		{#if DEFAULT_MODE}
			<span class="mr-4 hidden sm:inline">
				{page.data.t('supersearch.filter')}
			</span>
		{/if}
	</button>
	{#if !DEFAULT_MODE}
		<h2 class="text-subtle ml-3 font-medium">
			{page.data.t('supersearch.add')}
			{page.data.t('supersearch.filter').toLowerCase()}
		</h2>
	{/if}
</div>
