<script lang="ts">
	import { page } from '$app/state';
	import { getSearchContext, Mode } from '$lib/contexts/search';
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

	const inDialog = $derived(!!getCellId);

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

<div role="row" class={['flex items-center', isFocusedRow && 'focused-row']}>
	<button
		type="button"
		id={rowIndex ? getCellId?.(rowIndex, 0) : undefined}
		class={[
			'flex min-h-11 min-w-11 items-center justify-start',
			inDialog ? 'h-14' : 'mt-1.5',
			inDialog && DEFAULT_MODE ? 'w-full px-2 lg:px-3' : 'mx-2 lg:mx-3',
			DEFAULT_MODE ? 'text-link' : 'text-subtle',

			rowIndex && isFocusedCell?.(rowIndex, 0) && 'focused-cell'
		]}
		onclick={handleClickLeadingButton}
		title={DEFAULT_MODE
			? `${page.data.t('supersearch.show')} ${page.data.t('supersearch.filter').toLowerCase()} (Shift+7)`
			: undefined}
		aria-label={!DEFAULT_MODE ? page.data.t('supersearch.back') : undefined}
	>
		<div class="flex min-h-11 items-center rounded-full border border-neutral-300">
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
		</div>
	</button>
	{#if !DEFAULT_MODE}
		<h2 class="text-subtle font-medium">
			{page.data.t('supersearch.add')}
			{page.data.t('supersearch.filter').toLowerCase()}
		</h2>
	{/if}
</div>
