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

<div
	role="row"
	class={[
		'flex min-h-12 items-center',
		isFocusedRow && 'focused-row',
		inDialog && 'mt-0.5 sm:mt-3.5',
		!inDialog && 'mt-2 ml-2 lg:mt-0 lg:ml-3',
		inDialog && !DEFAULT_MODE && 'mb-2'
	]}
>
	<button
		type="button"
		id={rowIndex ? getCellId?.(rowIndex, 0) : undefined}
		class={[
			'flex h-full cursor-default items-center justify-center',
			inDialog && DEFAULT_MODE && 'w-full justify-start px-0.75 sm:px-2 lg:px-3',
			inDialog && !DEFAULT_MODE && 'hidden w-14 sm:flex',
			DEFAULT_MODE ? 'text-link' : 'text-subtle',

			rowIndex && isFocusedCell?.(rowIndex, 0) && 'focused-cell'
		]}
		onclick={handleClickLeadingButton}
		aria-label={!DEFAULT_MODE ? page.data.t('supersearch.back') : undefined}
	>
		<div
			class={[
				'flex cursor-pointer items-center justify-center rounded-full border',
				!inDialog && 'min-h-11 border-neutral-300',
				inDialog && 'border-transparent',
				inDialog && DEFAULT_MODE && 'min-h-12',
				inDialog && !DEFAULT_MODE && 'size-8'
			]}
			title={DEFAULT_MODE
				? `${page.data.t('supersearch.show')} ${page.data.t('supersearch.filter').toLowerCase()} (Shift+7)`
				: undefined}
		>
			<div class="flex w-11 items-center justify-center">
				{#if DEFAULT_MODE}
					<IconFilter />
				{:else}
					<IconBack class="size-4.5" />
				{/if}
			</div>
			{#if DEFAULT_MODE}
				<span class={['mr-4', !inDialog && 'hidden sm:inline']}>
					{page.data.t('supersearch.filter')}
				</span>
			{/if}
		</div>
	</button>
	{#if !DEFAULT_MODE}
		<h2 class="text-subtle px-3 font-medium sm:px-0">
			{page.data.t('supersearch.add')}
			{page.data.t('supersearch.filter').toLowerCase()}
		</h2>
	{/if}
</div>
